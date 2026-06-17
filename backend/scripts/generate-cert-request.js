/**
 * Script para generar el par de claves y el CSR (Certificate Signing Request) para AFIP.
 *
 * Uso:
 *   node scripts/generate-cert-request.js <CUIT> "<Razon Social>"
 *
 * Ejemplo:
 *   node scripts/generate-cert-request.js 20123456789 "MAAS YOGA"
 *
 * Genera:
 *   certs/maasyoga.key  → Clave privada (GUARDAR EN EL SERVIDOR, NO COMPARTIR)
 *   certs/maasyoga.csr  → Solicitud de certificado (presentar en AFIP)
 */

import forge from "node-forge";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CUIT = process.argv[2];
const RAZON_SOCIAL = process.argv[3] || "MAAS YOGA";

if (!CUIT) {
  console.error("❌ Error: debe proveer el CUIT como primer argumento.");
  console.error("   Uso: node scripts/generate-cert-request.js <CUIT> \"<Razon Social>\"");
  process.exit(1);
}

console.log(`\n🔐 Generando clave privada RSA 2048 bits para CUIT ${CUIT}...`);

const keypair = forge.pki.rsa.generateKeyPair(2048);
const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

const csr = forge.pki.createCertificationRequest();
csr.publicKey = keypair.publicKey;
csr.setSubject([
  { name: "commonName", value: `AFIP - CUIT ${CUIT}` },
  { type: "2.5.4.5", value: `CUIT ${CUIT}` },
  { name: "countryName", value: "AR" },
  { name: "organizationName", value: RAZON_SOCIAL },
]);

csr.sign(keypair.privateKey, forge.md.sha256.create());
const csrPem = forge.pki.certificationRequestToPem(csr);

const certsDir = path.join(__dirname, "..", "certs");
if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

const keyPath = path.join(certsDir, "maasyoga.key");
const csrPath = path.join(certsDir, "maasyoga.csr");

fs.writeFileSync(keyPath, privateKeyPem);
fs.writeFileSync(csrPath, csrPem);

console.log("\n✅ Archivos generados correctamente:\n");
console.log(`  📄 ${keyPath}`);
console.log("     → Clave privada. GUARDAR EN EL SERVIDOR. NO COMPARTIR.\n");
console.log(`  📄 ${csrPath}`);
console.log("     → Presentar en AFIP para obtener el certificado (.crt):\n");
console.log("     1. Ingresar a https://auth.afip.gov.ar con el CUIT de Maas Yoga");
console.log("     2. Ir a 'Administración de Certificados Digitales'");
console.log("     3. Crear nuevo certificado → subir maasyoga.csr");
console.log("     4. Descargar el .crt que genera AFIP");
console.log("     5. Guardarlo como certs/maasyoga.crt en el servidor\n");
