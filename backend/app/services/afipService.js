/**
 * Servicio de integración con AFIP para facturación electrónica.
 * Implementación directa usando node-forge (PKCS7) + https nativo.
 * No requiere librerías externas con restricciones de plataforma.
 *
 * Tipos de comprobante:
 *   1 → Factura A (Responsable Inscripto)
 *   6 → Factura B (Consumidor Final)
 */

import { execSync } from "child_process";
import https from "https";
import fs from "fs";
import os from "os";
import path from "path";
import { student, payment } from "../db/index.js";

const WSAA_URL = {
  homologation: "https://wsaahomo.afip.gov.ar/ws/services/LoginCms",
  production: "https://wsaa.afip.gov.ar/ws/services/LoginCms",
};

const WSFE_URL = {
  homologation: "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
  production: "https://servicios1.afip.gov.ar/wsfev1/service.asmx",
};

const INVOICE_TYPES = {
  CONSUMIDOR_FINAL:     { cbte: 6, label: "Factura B", docTipo: 99, condIvaReceptor: 5 },
  RESPONSABLE_INSCRIPTO:{ cbte: 1, label: "Factura A", docTipo: 80, condIvaReceptor: 1 },
  MONOTRIBUTO:          { cbte: 6, label: "Factura B", docTipo: 80, condIvaReceptor: 6 },
  EXENTO:               { cbte: 6, label: "Factura B", docTipo: 80, condIvaReceptor: 4 },
};

const getEnv = () => process.env.AFIP_ENV === "production" ? "production" : "homologation";

const TOKEN_CACHE_FILE = path.join(process.cwd(), "certs", ".token_cache.json");

const loadTokenFromFile = () => {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf8"));
      if (new Date(data.expiresAt) > new Date()) return data;
    }
  } catch {}
  return { token: null, sign: null, expiresAt: null };
};

const saveTokenToFile = (cache) => {
  try { fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache)); } catch {}
};

let tokenCache = loadTokenFromFile();

const buildTRA = (service) => {
  const now = new Date();
  const gen = new Date(now.getTime() - 10 * 60 * 1000);
  const exp = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const fmt = (d) => {
    const ar = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    return ar.toISOString().slice(0, 19) + "-03:00";
  };
  const uniqueId = Math.floor(Math.random() * 2147483647);
  return `<?xml version="1.0" encoding="UTF-8"?><loginTicketRequest version="1.0"><header><uniqueId>${uniqueId}</uniqueId><generationTime>${fmt(gen)}</generationTime><expirationTime>${fmt(exp)}</expirationTime></header><service>${service}</service></loginTicketRequest>`;
};

const signTRA = (tra, certPath, keyPath) => {
  const tmpFile = path.join(os.tmpdir(), `afip_tra_${Date.now()}.xml`);
  try {
    fs.writeFileSync(tmpFile, tra);
    const cms = execSync(
      `openssl cms -sign -in "${tmpFile}" -signer "${certPath}" -inkey "${keyPath}" -nodetach -outform DER | openssl base64 -A`,
      { timeout: 10000 }
    ).toString().trim();
    return cms;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
};

const soapRequest = (url, soapAction, body) => {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": soapAction,
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

const getToken = async () => {
  if (tokenCache.token && tokenCache.expiresAt > new Date()) return tokenCache;

  const tra = buildTRA("wsfe");
  const cms = signTRA(tra, process.env.AFIP_CERT_PATH, process.env.AFIP_KEY_PATH);
  const env = getEnv();

  const wsaaBody = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><loginCms xmlns="http://wsaa.view.sua.dvadac.desein.afip.gov"><in0>${cms}</in0></loginCms></soap:Body></soap:Envelope>`;
  const response = await soapRequest(WSAA_URL[env], "", wsaaBody);

  const decoded = response
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
  const tokenMatch = decoded.match(/<token>([\s\S]*?)<\/token>/);
  const signMatch = decoded.match(/<sign>([\s\S]*?)<\/sign>/);
  if (!tokenMatch || !signMatch) {
    if (response.includes("alreadyAuthenticated") && tokenCache.token) {
      console.warn("WSAA: alreadyAuthenticated — usando token en caché");
      return tokenCache;
    }
    throw new Error("WSAA fallo: " + response);
  }

  tokenCache = {
    token: tokenMatch[1].trim(),
    sign: signMatch[1].trim(),
    expiresAt: new Date(Date.now() + 11 * 60 * 60 * 1000),
  };
  saveTokenToFile(tokenCache);
  return tokenCache;
};

const getLastVoucher = async (puntoVenta, cbteTipo, cuit, token, sign) => {
  const env = getEnv();
  const body = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soap:Body><ar:FECompUltimoAutorizado>
    <ar:Auth><ar:Token>${token}</ar:Token><ar:Sign>${sign}</ar:Sign><ar:Cuit>${cuit}</ar:Cuit></ar:Auth>
    <ar:PtoVta>${puntoVenta}</ar:PtoVta>
    <ar:CbteTipo>${cbteTipo}</ar:CbteTipo>
  </ar:FECompUltimoAutorizado></soap:Body>
</soap:Envelope>`;
  const response = await soapRequest(WSFE_URL[env], "http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado", body);
  const match = response.match(/<CbteNro>(\d+)<\/CbteNro>/);
  return match ? parseInt(match[1]) : 0;
};

const getInvoiceConfig = (ivaCondition, cuit) => {
  const config = INVOICE_TYPES[ivaCondition] || INVOICE_TYPES.CONSUMIDOR_FINAL;
  return {
    cbteTipo: config.cbte,
    label: config.label,
    docTipo: config.docTipo,
    condIvaReceptor: config.condIvaReceptor,
    docNro: ivaCondition === "RESPONSABLE_INSCRIPTO" && cuit ? parseInt(cuit.replace(/\D/g, "")) : 0,
  };
};

export const emitirFactura = async (paymentId) => {
  const certPath = process.env.AFIP_CERT_PATH;
  const keyPath = process.env.AFIP_KEY_PATH;
  const cuit = process.env.AFIP_CUIT;
  const puntoVenta = parseInt(process.env.AFIP_PUNTO_VENTA || "1");

  if (!certPath || !keyPath || !cuit) return null;
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.warn("AFIP: archivos de certificado no encontrados. Facturación deshabilitada.");
    return null;
  }

  const paymentDb = await payment.findByPk(paymentId, { include: [{ model: student }] });
  if (!paymentDb) throw new Error(`Pago ${paymentId} no encontrado`);

  const alumno = paymentDb.student;
  const ivaCondition = alumno?.ivaCondition || "CONSUMIDOR_FINAL";
  const { cbteTipo, label, docTipo, docNro, condIvaReceptor } = getInvoiceConfig(ivaCondition, alumno?.cuit);

  const valor = parseFloat(paymentDb.value) || 0;
  const descuento = parseFloat(paymentDb.discount) || 0;
  const total = parseFloat((valor - (valor * descuento) / 100).toFixed(2));

  const esResponsable = process.env.AFIP_REGIMEN === "responsable";
  const impNeto   = esResponsable ? parseFloat((total / 1.21).toFixed(2)) : 0;
  const impIVA    = esResponsable ? parseFloat((total - impNeto).toFixed(2)) : 0;
  const impOpEx   = esResponsable ? 0 : total;
  const ivaDetalle = esResponsable
    ? `<ar:Iva><ar:AlicIva><ar:Id>5</ar:Id><ar:BaseImp>${impNeto}</ar:BaseImp><ar:Importe>${impIVA}</ar:Importe></ar:AlicIva></ar:Iva>`
    : "";

  const { token, sign } = await getToken();
  const nroComprobante = (await getLastVoucher(puntoVenta, cbteTipo, cuit, token, sign)) + 1;

  const hoy = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const fechaCbte = `${hoy.getFullYear()}${pad(hoy.getMonth() + 1)}${pad(hoy.getDate())}`;
  const primerDia = `${hoy.getFullYear()}${pad(hoy.getMonth() + 1)}01`;
  const ultimoDia = `${hoy.getFullYear()}${pad(hoy.getMonth() + 1)}${pad(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate())}`;

  const wsfeBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soap:Body><ar:FECAESolicitar>
    <ar:Auth><ar:Token>${token}</ar:Token><ar:Sign>${sign}</ar:Sign><ar:Cuit>${cuit}</ar:Cuit></ar:Auth>
    <ar:FeCAEReq>
      <ar:FeCabReq><ar:CantReg>1</ar:CantReg><ar:PtoVta>${puntoVenta}</ar:PtoVta><ar:CbteTipo>${cbteTipo}</ar:CbteTipo></ar:FeCabReq>
      <ar:FeDetReq><ar:FECAEDetRequest>
        <ar:Concepto>2</ar:Concepto>
        <ar:DocTipo>${docTipo}</ar:DocTipo><ar:DocNro>${docNro}</ar:DocNro>
        <ar:CbteDesde>${nroComprobante}</ar:CbteDesde><ar:CbteHasta>${nroComprobante}</ar:CbteHasta>
        <ar:CbteFch>${fechaCbte}</ar:CbteFch>
        <ar:FchServDesde>${primerDia}</ar:FchServDesde>
        <ar:FchServHasta>${ultimoDia}</ar:FchServHasta>
        <ar:FchVtoPago>${fechaCbte}</ar:FchVtoPago>
        <ar:ImpTotal>${total}</ar:ImpTotal><ar:ImpTotConc>0</ar:ImpTotConc>
        <ar:ImpNeto>${impNeto}</ar:ImpNeto><ar:ImpOpEx>${impOpEx}</ar:ImpOpEx>
        <ar:ImpIVA>${impIVA}</ar:ImpIVA><ar:ImpTrib>0</ar:ImpTrib>
        <ar:MonId>PES</ar:MonId><ar:MonCotiz>1</ar:MonCotiz>
        ${ivaDetalle}
        <ar:CondicionIVAReceptorId>${condIvaReceptor}</ar:CondicionIVAReceptorId>
      </ar:FECAEDetRequest></ar:FeDetReq>
    </ar:FeCAEReq>
  </ar:FECAESolicitar></soap:Body>
</soap:Envelope>`;

  const response = await soapRequest(WSFE_URL[getEnv()], "http://ar.gov.afip.dif.FEV1/FECAESolicitar", wsfeBody);

  const errMatch = response.match(/<Msg>([\s\S]*?)<\/Msg>/);
  const caeMatch = response.match(/<CAE>([\s\S]*?)<\/CAE>/);
  const caeFchMatch = response.match(/<CAEFchVto>([\s\S]*?)<\/CAEFchVto>/);

  if (!caeMatch) {
    const msg = errMatch ? errMatch[1].trim() : response;
    throw new Error(`AFIP no devolvió CAE: ${msg}`);
  }

  const cae = caeMatch[1].trim();
  const raw = caeFchMatch ? caeFchMatch[1].trim() : null;
  const caeVencimiento = raw ? `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}` : null;

  await paymentDb.update({ cae, caeVencimiento, invoiceNumber: nroComprobante, invoiceType: label });
  console.log(`✅ Factura emitida: ${label} N° ${nroComprobante} | CAE: ${cae} | Pago: ${paymentId}`);

  return { cae, caeVencimiento, invoiceNumber: nroComprobante, invoiceType: label };
};

export const requiresInvoice = (paymentType) => {
  const INVOICEABLE = ["Mercado pago", "Transferencia", "Tarjeta de credito", "Débito de cuenta", "Débito de tarjeta"];
  return INVOICEABLE.includes(paymentType);
};
