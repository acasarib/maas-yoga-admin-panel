import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveReceptorDoc, DOC_TIPO } from "./afipService.js";

test("resolveReceptorDoc: Factura A (Responsable Inscripto) siempre usa CUIT, sin importar docType", () => {
  const r1 = resolveReceptorDoc("RESPONSABLE_INSCRIPTO", { docType: "DNI", document: "12345678", cuit: "20-12345678-9" });
  assert.equal(r1.docTipo, DOC_TIPO.CUIT);
  assert.equal(r1.docNro, 20123456789);

  const r2 = resolveReceptorDoc("RESPONSABLE_INSCRIPTO", { docType: undefined, cuit: "20-12345678-9" });
  assert.equal(r2.docTipo, DOC_TIPO.CUIT);
  assert.equal(r2.docNro, 20123456789);
});

test("resolveReceptorDoc: Factura A sin CUIT cargado manda docNro 0 (no cae a DNI)", () => {
  const r = resolveReceptorDoc("RESPONSABLE_INSCRIPTO", { docType: "DNI", document: "12345678", cuit: null });
  assert.equal(r.docTipo, DOC_TIPO.CUIT);
  assert.equal(r.docNro, 0);
});

test("resolveReceptorDoc: Factura B con docType DNI usa docTipo 96", () => {
  const r = resolveReceptorDoc("CONSUMIDOR_FINAL", { docType: "DNI", document: "30123456" });
  assert.equal(r.docTipo, DOC_TIPO.DNI);
  assert.equal(r.docNro, 30123456);
});

test("resolveReceptorDoc: Factura B con docType CUIT usa docTipo 80", () => {
  const r = resolveReceptorDoc("MONOTRIBUTO", { docType: "CUIT", cuit: "27-30123456-4" });
  assert.equal(r.docTipo, DOC_TIPO.CUIT);
  assert.equal(r.docNro, 27301234564);
});

test("resolveReceptorDoc: Factura B con docType CUIL usa docTipo 86", () => {
  const r = resolveReceptorDoc("EXENTO", { docType: "CUIL", cuit: "27-30123456-4" });
  assert.equal(r.docTipo, DOC_TIPO.CUIL);
  assert.equal(r.docNro, 27301234564);
});

test("resolveReceptorDoc: Factura B sin docType (o sin dato correspondiente) queda sin identificar", () => {
  const sinTipo = resolveReceptorDoc("CONSUMIDOR_FINAL", {});
  assert.equal(sinTipo.docTipo, DOC_TIPO.SIN_IDENTIFICAR);
  assert.equal(sinTipo.docNro, 0);

  const dniSinNumero = resolveReceptorDoc("CONSUMIDOR_FINAL", { docType: "DNI", document: null });
  assert.equal(dniSinNumero.docTipo, DOC_TIPO.SIN_IDENTIFICAR);

  const cuitSinNumero = resolveReceptorDoc("CONSUMIDOR_FINAL", { docType: "CUIT", cuit: null });
  assert.equal(cuitSinNumero.docTipo, DOC_TIPO.SIN_IDENTIFICAR);
});
