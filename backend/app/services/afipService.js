/**
 * Servicio de integración con AFIP para facturación electrónica.
 * Implementación directa usando node-forge (PKCS7) + https nativo.
 * No requiere librerías externas con restricciones de plataforma.
 *
 * Tipos de comprobante:
 *   1 → Factura A (Responsable Inscripto)
 *   6 → Factura B (Consumidor Final)
 */

import forge from "node-forge";
import https from "https";
import fs from "fs";
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
  CONSUMIDOR_FINAL: { cbte: 6, label: "Factura B", docTipo: 99 },
  RESPONSABLE_INSCRIPTO: { cbte: 1, label: "Factura A", docTipo: 80 },
};

const getEnv = () => process.env.AFIP_ENV === "production" ? "production" : "homologation";

let tokenCache = { token: null, sign: null, expiresAt: null };

const buildTRA = (service) => {
  const now = new Date();
  const gen = new Date(now.getTime() - 10 * 60 * 1000);
  const exp = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace("Z", "-03:00");
  const uniqueId = Math.floor(Math.random() * 2147483647);
  return `<?xml version="1.0" encoding="UTF-8"?><loginTicketRequest version="1.0"><header><uniqueId>${uniqueId}</uniqueId><generationTime>${fmt(gen)}</generationTime><expirationTime>${fmt(exp)}</expirationTime></header><service>${service}</service></loginTicketRequest>`;
};

const signTRA = (tra, certPem, keyPem) => {
  const cert = forge.pki.certificateFromPem(certPem);
  const privateKey = forge.pki.privateKeyFromPem(keyPem);
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(tra, "utf8");
  p7.addCertificate(cert);
  p7.addSigner({
    key: privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date() },
    ],
  });
  p7.sign();
  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return forge.util.encode64(der);
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

  const certPem = fs.readFileSync(process.env.AFIP_CERT_PATH).toString();
  const keyPem = fs.readFileSync(process.env.AFIP_KEY_PATH).toString();
  const tra = buildTRA("wsfe");
  const cms = signTRA(tra, certPem, keyPem);
  const env = getEnv();

  const wsaaBody = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><loginCms xmlns="http://wsaa.view.sua.dvadac.desein.afip.gov"><in0>${cms}</in0></loginCms></soap:Body></soap:Envelope>`;
  const response = await soapRequest(WSAA_URL[env], "", wsaaBody);

  const tokenMatch = response.match(/<token>([\s\S]*?)<\/token>/);
  const signMatch = response.match(/<sign>([\s\S]*?)<\/sign>/);
  if (!tokenMatch || !signMatch) throw new Error("WSAA fallo: " + response);

  tokenCache = {
    token: tokenMatch[1].trim(),
    sign: signMatch[1].trim(),
    expiresAt: new Date(Date.now() + 11 * 60 * 60 * 1000),
  };
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
  const { cbteTipo, label, docTipo, docNro } = getInvoiceConfig(ivaCondition, alumno?.cuit);

  const valor = parseFloat(paymentDb.value) || 0;
  const descuento = parseFloat(paymentDb.discount) || 0;
  const total = parseFloat((valor - (valor * descuento) / 100).toFixed(2));

  const { token, sign } = await getToken();
  const nroComprobante = (await getLastVoucher(puntoVenta, cbteTipo, cuit, token, sign)) + 1;

  const hoy = new Date();
  const fechaCbte = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, "0")}${String(hoy.getDate()).padStart(2, "0")}`;

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
        <ar:ImpTotal>${total}</ar:ImpTotal><ar:ImpTotConc>0</ar:ImpTotConc>
        <ar:ImpNeto>${total}</ar:ImpNeto><ar:ImpOpEx>0</ar:ImpOpEx>
        <ar:ImpIVA>0</ar:ImpIVA><ar:ImpTrib>0</ar:ImpTrib>
        <ar:MonId>PES</ar:MonId><ar:MonCotiz>1</ar:MonCotiz>
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
