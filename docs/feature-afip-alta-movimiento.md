# Feature: Emisión de Factura AFIP desde el Formulario de Alta de Movimiento

## Resumen ejecutivo

Actualmente la emisión de factura AFIP se realiza **post-creación** del pago, desde el botón en la tabla de pagos. El objetivo de este feature es integrar la opción de emitir factura AFIP directamente desde el **formulario de alta de un ingreso** (modal "Informar ingreso"), de forma similar a como ya existe el checkbox "Generar recibo" para pagos en efectivo.

---

## Estado actual

### Flujo existente (post-creación)

```
[Tabla de pagos]
  └── [InvoiceButton] (visible solo para tipos facturables + pagos con alumno)
        └── [EmitirFacturaModal]
              ├── Búsqueda/selección de alumno
              ├── Condición IVA + CUIT
              └── [Emitir] → POST /payments/:id/invoice
                    └── Modal queda abierto mostrando CAE
                          ├── [Descargar PDF] → GET /payments/:id/invoice/pdf
                          └── [Enviar por email] → POST /payments/:id/invoice/email
```

### Componentes involucrados

| Componente/Archivo | Rol |
|---|---|
| `frontend/src/components/paymentsTable/index.jsx` | Renderiza `InvoiceButton` con filtro de tipos facturables y `studentId` |
| `frontend/src/components/button/invoiceButton.jsx` | Botón visual (acepta `className` para `invisible`) |
| `frontend/src/components/modal/emitirFacturaModal.jsx` | Modal completo: búsqueda alumno, datos fiscales, emisión, descarga, email |
| `frontend/src/components/section/payments/paymentsSection.jsx` | Formulario de alta de movimiento (modal "Informar ingreso/egreso") |
| `frontend/src/services/paymentsService.js` | `emitirFactura`, `downloadInvoicePDF`, `sendInvoiceByEmail` |
| `backend/app/controllers/paymentsController.js` | `emitirFactura`, `downloadInvoicePDF`, `sendInvoiceByEmail` |
| `backend/app/routes/paymentsRoute.js` | `POST /:id/invoice`, `GET /:id/invoice/pdf`, `POST /:id/invoice/email` |
| `backend/app/services/afipService.js` | WSAA + WSFE, tipos de comprobante, guard anti-duplicado via CAE |
| `backend/app/utils/pdfUtils.js` | `generateAfipInvoicePDF` con layout RG 4291 + QR |
| `backend/app/templates/invoice_email.html` | Template HTML del email de factura |

### Tipos de pago facturables (`INVOICEABLE_TYPES`)

```js
// paymentsTable/index.jsx
const INVOICEABLE_TYPES = [
  "Mercado pago", "Transferencia", "Tarjeta de credito",
  "Débito de cuenta", "Débito de tarjeta"
];
```

Tipos **no facturables**: Efectivo (genera recibo), Paypal, Crédito en proveedor/cuenta/tarjeta.

### Tipos de comprobante AFIP

| Condición IVA | Comprobante | CbteNro AFIP |
|---|---|---|
| CONSUMIDOR_FINAL | Factura B | 6 |
| RESPONSABLE_INSCRIPTO | Factura A | 1 |
| MONOTRIBUTO | Factura B | 6 |
| EXENTO | Factura B | 6 |

---

## Descripción del feature

### Objetivo

Agregar en el modal de alta de ingreso un **checkbox "Emitir factura AFIP"** que, al estar marcado y al guardar el pago, dispare automáticamente la emisión de la factura. El comportamiento posterior (mostrar modal con CAE, descarga, email) queda igual al flujo existente.

### Condiciones de visibilidad

El checkbox solo debe aparecer cuando se cumplen **todas** estas condiciones:

1. Es un **ingreso** (no un egreso → `!isDischarge`)
2. El modo de pago seleccionado es uno de los `INVOICEABLE_TYPES`
3. Hay un **alumno seleccionado** (`selectedStudent !== null`)

### Comportamiento esperado paso a paso

```
[Modal "Informar ingreso"]
  ├── Seleccionar alumno → selectedStudent
  ├── Seleccionar modo de pago (ej: Transferencia)
  │     └── [Aparece] checkbox "Emitir factura AFIP"
  │           └── [Si marcado] → muestra condición IVA (pre-llenada del alumno) y CUIT
  └── [Informar]
        ├── POST /payments → crea el pago (savedPayment)
        └── [Si checkbox marcado] → POST /payments/:id/invoice
              └── Modal de resultado: muestra CAE, botones Descargar + Enviar email
```

---

## Análisis técnico

### Frontend

#### `paymentsSection.jsx` — cambios requeridos

1. **Nuevo estado**: `emitirFactura` (boolean), `ivaConditionFactura`, `cuitFactura`
2. **Condicional de visibilidad** del checkbox:
   ```js
   const shouldShowInvoiceCheckbox =
     !isDischarge &&
     INVOICEABLE_TYPES.includes(paymentMethod?.value || paymentMethod) &&
     selectedStudent !== null;
   ```
3. **Al abrir el checkbox**: pre-llenar `ivaConditionFactura` con `selectedStudent.ivaCondition` y `cuitFactura` con `selectedStudent.cuit`
4. **En `handleInformPayment`**, después de crear el pago:
   ```js
   const savedPayment = await informPayment(data, sendReceipt);
   if (emitirFactura) {
     await paymentsService.emitirFactura(savedPayment.id, {
       studentId: selectedStudent.id,
       ivaCondition: ivaConditionFactura,
       cuit: cuitFactura,
     });
     // abrir modal de resultado con savedPayment.id
   }
   ```
5. **Modal de resultado**: reutilizar `EmitirFacturaModal` en modo "ya emitida" pasando el pago recién creado con el CAE retornado, **o** abrir el modal directamente con el resultado de la emisión.

#### Opción de implementación: reutilizar `EmitirFacturaModal`

Agregar estado `invoiceResultPayment` en `paymentsSection.jsx`:

```jsx
const [invoiceResultPayment, setInvoiceResultPayment] = useState(null);
const invoiceResultModal = useToggle(false);

// después de emitir:
setInvoiceResultPayment({ ...savedPayment, ...emitidaResult });
invoiceResultModal.open();

// en el JSX:
<EmitirFacturaModal
  payment={invoiceResultPayment}
  isOpen={invoiceResultModal.value}
  onClose={invoiceResultModal.disable}
/>
```

`EmitirFacturaModal` ya detecta `payment.cae` para entrar directamente en el estado "factura emitida" mostrando CAE, descarga y email.

#### Campos de condición IVA y CUIT en el formulario

Cuando el checkbox está marcado, mostrar inline (debajo del checkbox):

- **Select condición IVA**: mismo `IVA_OPTIONS` que usa `EmitirFacturaModal`
- **Input CUIT**: con el mismo `formatCuit()` helper

Estos campos deben pre-llenarse con los datos del alumno y ser editables.

### Backend

No requiere cambios. El endpoint `POST /payments/:id/invoice` ya:
- Recibe `studentId`, `ivaCondition`, `cuit`
- Guarda datos fiscales en el alumno si no los tenía
- Guarda `cae`, `caeVencimiento`, `invoiceNumber`, `invoiceType` en el pago
- Tiene guard anti-duplicado: si el pago ya tiene CAE lanza error

### Datos del modelo `Payment`

```js
// backend/app/db/models/payment.js (campos relevantes)
cae:             DataTypes.STRING
caeVencimiento:  DataTypes.DATEONLY
invoiceNumber:   DataTypes.INTEGER
invoiceType:     DataTypes.STRING  // "Factura A" | "Factura B"
```

---

## Análisis funcional

### UX/UI

| Escenario | Comportamiento |
|---|---|
| Modo pago NO facturable (Efectivo, etc.) | Checkbox no aparece |
| No hay alumno seleccionado | Checkbox no aparece |
| Checkbox desmarcado | Flujo normal, sin emisión |
| Checkbox marcado, alumno sin datos fiscales | CUIT e IVA quedan vacíos, editables; warning visual |
| Checkbox marcado, emisión exitosa | Se cierra modal de alta, se abre modal de resultado con CAE |
| Error al emitir la factura | Alert de error; el pago ya fue creado (no se revierte) |
| Es un egreso (`isDischarge`) | Checkbox nunca aparece |

### Warning de pago ya creado pero factura fallida

Es importante comunicar al usuario que **el pago ya fue creado** aunque la emisión haya fallado. El error no debe deshacer el pago. Mensaje sugerido:

> "El movimiento fue informado pero no se pudo emitir la factura AFIP. Podés intentarlo desde la tabla de pagos."

### Consistencia con flujo existente de recibo

El checkbox de "Generar recibo" (solo para Efectivo) y el de "Emitir factura AFIP" (para tipos facturables) son **mutuamente excluyentes** por diseño: Efectivo no es un tipo facturable, por lo que nunca aparecerán juntos.

---

## Plan de implementación

### Paso 1 — Constante compartida de tipos facturables

Mover `INVOICEABLE_TYPES` de `paymentsTable/index.jsx` a `frontend/src/constants.js` para reutilizarla en `paymentsSection.jsx`.

```js
// constants.js
export const INVOICEABLE_PAYMENT_TYPES = [
  "Mercado pago", "Transferencia", "Tarjeta de credito",
  "Débito de cuenta", "Débito de tarjeta"
];
```

### Paso 2 — Estado y lógica en `paymentsSection.jsx`

- Agregar estados: `emitirFacturaAfip`, `ivaConditionFactura`, `cuitFactura`, `invoiceResultPayment`, `invoiceResultOpen`
- Agregar lógica `shouldShowInvoiceCheckbox`
- Modificar `handleInformPayment` para emitir si el checkbox está marcado
- Limpiar estados en `setDisplay` y al finalizar el submit

### Paso 3 — UI del checkbox y campos fiscales en `paymentsSection.jsx`

- Checkbox "Emitir factura AFIP" con `InfoIcon` tooltip
- Condicional de visibilidad
- Select IVA e input CUIT inline (cuando checkbox activo)
- Warning si el alumno no tiene datos fiscales

### Paso 4 — Modal de resultado

- Instanciar `EmitirFacturaModal` en `paymentsSection.jsx` con `invoiceResultPayment` e `invoiceResultOpen`
- Al terminar el submit, poblar `invoiceResultPayment` con el pago creado + datos de la factura emitida

### Paso 5 — Actualizar `paymentsTable/index.jsx`

- Importar `INVOICEABLE_PAYMENT_TYPES` desde `constants.js` en lugar de definirlo localmente

---

## Archivos a modificar

| Archivo | Tipo de cambio |
|---|---|
| `frontend/src/constants.js` | Agregar `INVOICEABLE_PAYMENT_TYPES` |
| `frontend/src/components/paymentsTable/index.jsx` | Importar constante desde `constants.js` |
| `frontend/src/components/section/payments/paymentsSection.jsx` | Estados, lógica, UI del checkbox + campos fiscales + modal resultado |
| `backend/*` | **Sin cambios** |

---

## Análisis de uso del modal de pagos (producción)

### Datos extraídos del dump 2026-06-25

**Total registros de pago: 19,580**

| Entidad | Registros | % |
|---|---|---|
| Alumno | 15,470 | 79% |
| Gasto operativo (sin entidad) | 2,534 | 13% |
| Profesor | 1,488 | 8% |
| Secretaria | 88 | 0.4% |

### ¿De dónde surge cada tipo?

| Tipo | Origen real |
|---|---|
| Ingresos de alumno | Modal "Informar ingreso" en `paymentsSection.jsx` |
| Egresos de profesor | `AddProfessorPaymentModal` desde `professorDetail.jsx` — **NO pasa por el modal general** |
| Egresos de secretaria | Modal "Informar egreso" — checkbox "Corresponde a un pago de secretaria" |
| Gastos operativos | Modal "Informar egreso" — categoría/item sin entidad asignada |

### Checkbox "Corresponde al pago de una clase"

Existe en el modal de ingreso. Al marcarlo, muestra un selector de profesor. Esto permite asociar un ingreso de alumno a un profesor específico (`professor_id` + `student_id` juntos). Fue usado **68 veces** en producción — todos los casos tienen alumno asignado (no es un egreso al profesor, sino una atribución del ingreso).

### Conclusión sobre tabs

- **Modal ingreso**: No justifica tabs. 99.7% son ingresos de alumnos. Mejoras puntuales son suficientes.
- **Modal egreso**: Tampoco justifica tabs — los egresos de profesores tienen su propio flujo dedicado. Lo que queda en el egreso general es: gastos operativos + secretaria (2 contextos, checkbox ya diferencia).

---

## Feature: Movimiento que abarca X meses

### Descripción

Desde el formulario de alta de un ingreso, el usuario puede indicar que ese pago **cubre múltiples meses consecutivos**. Se crea un **único registro de pago** (no N registros separados), con un campo que indica la cantidad de meses que abarca.

**Ejemplo de uso**: una alumna paga 3 meses por adelantado → se registra 1 solo movimiento que cubre "3 meses" (ej: junio, julio, agosto).

### Lo que NO hace

- ❌ No genera N pagos individuales (1 por mes)
- ❌ No divide el monto entre meses

### Lo que SÍ hace

- ✅ Crea 1 único pago con un campo `months` (o similar) que indica cuántos meses cubre
- ✅ El monto registrado es el total pagado
- ✅ Opcionalmente puede mostrarse en la tabla indicando el período cubierto

### Cambios requeridos

#### Frontend — `paymentsSection.jsx`

- Agregar un campo numérico (o selector) "Cantidad de meses" en el formulario de alta
- Solo visible para ingresos con alumno seleccionado
- Valor por defecto: 1

#### Backend — modelo y controlador

- Evaluar si el modelo `Payment` necesita un campo `months` (entero, default 1)
- Si se agrega el campo, incluirlo en el `create` del controlador

#### UI en tabla de pagos

- Mostrar indicación del período cubierto cuando `months > 1` (ej: "3 meses")

### Pendiente de definir

- ¿Se persiste el campo `months` en el modelo o se calcula/muestra solo desde el `note`/descripción?
- ¿Requiere migración de base de datos?

---

## Dependencias y riesgos

| Riesgo | Mitigación |
|---|---|
| El pago se crea pero la factura falla | Alert claro; el botón de factura sigue disponible en la tabla |
| El alumno no tiene CUIT/IVA | Campos editables inline; se guardan al emitir (comportamiento actual del endpoint) |
| Doble emisión accidental | Guard en `afipService.js` (si `payment.cae` existe, lanza error) |
| `EmitirFacturaModal` espera `payment.cae` para mostrar resultado | Pasar objeto combinado `{ ...savedPayment, cae, invoiceType, invoiceNumber, caeVencimiento }` |
