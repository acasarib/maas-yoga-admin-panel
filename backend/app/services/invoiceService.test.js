import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeItems,
  findInvalidAmountItem,
  resolveSameStudentId,
  findAlreadyInvoicedIds,
  MixedStudentsError,
} from "./invoiceService.js";

test("normalizeItems: concepto vacío o ausente se persiste como 'Servicio'", () => {
  const result = normalizeItems([
    { paymentId: 1, concept: "", amount: 100 },
    { paymentId: 2, concept: "   ", amount: 200 },
    { paymentId: 3, amount: 300 },
    { paymentId: 4, concept: "Cuota marzo", amount: 400 },
  ]);
  assert.equal(result[0].concept, "Servicio");
  assert.equal(result[1].concept, "Servicio");
  assert.equal(result[2].concept, "Servicio");
  assert.equal(result[3].concept, "Cuota marzo");
});

test("normalizeItems: totalAmount de la factura es la suma de los montos de cada ítem", () => {
  const result = normalizeItems([
    { paymentId: 1, concept: "A", amount: "100.50" },
    { paymentId: 2, concept: "B", amount: 1500 },
  ]);
  const total = result.reduce((sum, item) => sum + item.amount, 0);
  assert.equal(total, 1600.5);
});

test("findInvalidAmountItem: detecta montos <= 0 o faltantes", () => {
  assert.equal(findInvalidAmountItem(normalizeItems([{ paymentId: 1, amount: 100 }])), null);
  const invalid = findInvalidAmountItem(normalizeItems([{ paymentId: 1, amount: 0 }]));
  assert.equal(invalid.paymentId, 1);
});

test("resolveSameStudentId: movimientos del mismo alumno resuelven sin error", () => {
  const payments = [{ id: 1, studentId: 45 }, { id: 2, studentId: 45 }];
  assert.equal(resolveSameStudentId(payments, 45), 45);
});

test("resolveSameStudentId: movimientos de alumnos distintos lanzan MixedStudentsError", () => {
  const payments = [{ id: 1, studentId: 45 }, { id: 2, studentId: 99 }];
  assert.throws(() => resolveSameStudentId(payments, 45), MixedStudentsError);
});

test("resolveSameStudentId: studentId declarado no coincide con el dueño real de los payments (IDOR)", () => {
  const payments = [{ id: 1, studentId: 45 }, { id: 2, studentId: 45 }];
  assert.throws(() => resolveSameStudentId(payments, 999), MixedStudentsError);
});

test("findAlreadyInvoicedIds: identifica movimientos que ya tienen cae", () => {
  const payments = [
    { id: 1, cae: null },
    { id: 2, cae: "71234567890123" },
    { id: 3, cae: undefined },
  ];
  assert.deepEqual(findAlreadyInvoicedIds(payments), [2]);
});

test("findAlreadyInvoicedIds: vacío cuando ningún movimiento tiene factura previa", () => {
  const payments = [{ id: 1, cae: null }, { id: 2, cae: null }];
  assert.deepEqual(findAlreadyInvoicedIds(payments), []);
});
