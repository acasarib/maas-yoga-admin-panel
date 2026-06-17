# AFIP — Certificados Digitales para Facturación Electrónica

## ¿Qué es esto?

AFIP requiere un par de archivos para que la aplicación pueda emitir facturas electrónicas de forma automática:

- **`maasyoga.key`** → Clave privada RSA. Nunca sale del servidor. Nunca se sube al repositorio.
- **`maasyoga.csr`** → Solicitud de certificado. Se presenta en AFIP una sola vez (y al renovar).
- **`maasyoga.crt`** → Certificado emitido por AFIP. Se descarga del portal y se copia al servidor.

Los tres archivos viven en `backend/certs/` (carpeta ignorada por git).

---

## Primera vez (o renovación)

### Paso 1 — Generar la clave privada y el CSR

Desde la carpeta `backend/`:

**Para producción (CUIT de Maas Yoga):**
```bash
node scripts/generate-cert-request.js 20XXXXXXXXX "MAAS YOGA"
```

**Para homologación (tu CUIT personal, para testing):**
```bash
node scripts/generate-cert-request.js 20TUCUITAQUI "MAAS YOGA"
```

Esto genera:
- `certs/maasyoga.key` → guardar, no compartir
- `certs/maasyoga.csr` → presentar en AFIP

---

### Paso 2 — Tramitar el certificado en AFIP

| Ambiente | URL |
|---|---|
| **Producción y Homologación** | https://auth.afip.gob.ar |

> El certificado se registra siempre en el mismo portal. La distinción entre homologación y producción la maneja la variable `AFIP_ENV` en el `.env` — no hay portal separado.

1. Ingresar con el CUIT y clave fiscal de quien va a usar el certificado
2. Ir a **"Administración de Certificados Digitales"**
3. Seleccionar **"Agregar alias"** o **"Nuevo certificado"**
4. Ingresar un alias (ej: `maasyoga-backend`)
5. Subir el archivo `certs/maasyoga.csr`
6. AFIP procesa y genera el `.crt` → **descargarlo**
7. Guardarlo como `certs/maasyoga.crt` en el servidor

---

### Paso 3 — Configurar el servidor

En el archivo `.env` del backend (en el servidor, nunca en el repo):

```env
AFIP_CUIT=20XXXXXXXXX
AFIP_CERT_PATH=./certs/maasyoga.crt
AFIP_KEY_PATH=./certs/maasyoga.key
AFIP_PUNTO_VENTA=1
AFIP_ENV=production
```

Para homologación usar `AFIP_ENV=homologation`.

---

### Paso 4 — Reiniciar el backend

```bash
# Si usás Docker
docker-compose restart backend

# Si usás pm2
pm2 restart maasyoga-backend
```

Al iniciar, el backend loguea:
- ✅ `Afip instance creada correctamente` si todo está bien
- ⚠️ Warning si faltan archivos o variables (no rompe nada, solo desactiva facturas)

---

## Renovación (cada ~2 años)

El certificado de AFIP vence. Cuando eso pase:

1. **Repetir Paso 1** → genera un nuevo par `.key` / `.csr` (el `.key` anterior queda obsoleto)
2. **Repetir Paso 2** → presentar el nuevo `.csr` en AFIP
3. **Reemplazar** `certs/maasyoga.key` y `certs/maasyoga.crt` en el servidor
4. **Reiniciar** el backend

> ⚠️ No hace falta tocar ningún código. Solo reemplazar los archivos y reiniciar.

---

## Estructura de archivos

```
backend/
├── certs/                    ← ignorado por git
│   ├── maasyoga.key          ← clave privada (NO COMMITEAR)
│   ├── maasyoga.csr          ← solicitud (generada por el script)
│   └── maasyoga.crt          ← certificado (descargado de AFIP)
├── scripts/
│   ├── generate-cert-request.js   ← script para generar key + csr
│   └── AFIP_CERTIFICADOS.md       ← este archivo
└── app/services/
    └── afipService.js             ← lógica de autenticación y emisión
```

---

## Lógica de facturación

| Medio de pago | Comprobante |
|---|---|
| Efectivo | Solo recibo (sin AFIP) |
| Mercado Pago | Factura automática |
| Transferencia | Factura automática |
| Tarjeta de crédito | Factura automática |
| Débito de cuenta | Factura automática |
| Débito de tarjeta | Factura automática |
| PayPal | Nada (caso especial) |

**Tipo de factura según condición IVA del alumno:**
- `CONSUMIDOR_FINAL` → Factura B (default para todos los alumnos)
- `RESPONSABLE_INSCRIPTO` → Factura A (se configura en el perfil del alumno, requiere su CUIT)

El CAE y número de factura se guardan en la tabla `payment` (`cae`, `caeVencimiento`, `invoiceNumber`, `invoiceType`).
