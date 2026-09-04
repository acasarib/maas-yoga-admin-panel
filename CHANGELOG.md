# Changelog

Todas las versiones notables de este proyecto se documentan en este archivo.

## [1.3.6] - 2026-09-04

### Agregado
- **Sistema de roles auditor con acceso de solo lectura.** Se agregó un nuevo rol "auditor" (además del existente "operator") con permisos restringidos a operaciones de lectura (GET). Los auditores no pueden crear, editar, eliminar ni verificar ningún recurso (usuarios, estudiantes, cursos, profesores, pagos, tareas, categorías, etc.). El rol se almacena en la columna `role` de la tabla `user` y se incluye en el JWT al login.
  - **Backend:** Middleware `blockAuditors` que rechaza con 403 FORBIDDEN todos los endpoints POST/PUT/PATCH/DELETE para usuarios con rol "auditor". Aplicado a ~60+ endpoints de escritura a través de 10 archivos de rutas.
  - **Frontend:** Botones de acción (crear, editar, eliminar, verificar, emitir factura) ocultados para auditors. Intentos de acción generan alertas de advertencia que explican la restricción.

- **Borrado suave (soft delete) de usuarios.** Los usuarios ahora se marcan como eliminados en lugar de ser borrados de la base de datos. Se agregó la columna `deletedAt` a la tabla `user`. El endpoint DELETE ahora actualiza `deletedAt` con la fecha/hora actual en lugar de ejecutar un DELETE FROM. Se agregó un endpoint PUT `/:email/restore` para restaurar usuarios eliminados (operadores solamente). Los usuarios eliminados no aparecen en las búsquedas ni listados normales.

- **Advertencia de vencimiento de certificado AFIP.** El backend ahora incluye información del certificado AFIP (notBefore, notAfter, subject, serialNumber, expiresSoon) en el endpoint de healthcheck. El frontend muestra una notificación dismissible en la esquina superior derecha cuando el certificado expira dentro de un mes, con mensaje multiline instructivo para renovarlo.

- **Sistema de logging con timestamps en el backend.** Todos los logs del backend ahora incluyen timestamp en formato ISO. Se creó una utilidad `logger` que envuelve `console.log`, `console.error`, `console.warn` y `console.info`. La aplicación muestra su versión al iniciar.

### Cambios técnicos
- Nueva columna `role` en tabla `user` (tipo STRING, default "operator").
- Nueva columna `deletedAt` en tabla `user` para soft delete (tipo DATE, nullable).
- Nuevo middleware `backend/app/middleware/withRole.js` con función `blockAuditors`.
- JWT payload ahora incluye `role` del usuario al login.
- Context frontend proporciona función `isAuditor()` que retorna boolean según rol del usuario autenticado.
- Nueva utilidad `logger` en `backend/app/utils/logger.js` con timestamps ISO.
- Log de versión al iniciar la aplicación en `backend/index.js`.
- Reemplazo de todos los `console.log`, `console.error` y `console.warn` por la utilidad `logger` en: `index.js`, `healthcheckService.js`, `paymentService.js`, `scheduledCronTasks.js`, `paymentsController.js`, `firstUserSeed.js`, `emailService.js`, `mercadoPagoService.js`, `coursesController.js`, `afipService.js`, `invoiceService.js`.

## [1.3.5] - 2026-08-27

### Agregado
- **Facturación AFIP: identificación del receptor con DNI, CUIT o CUIL.** Al emitir una Factura B (Consumidor Final, Monotributo o Exento), ahora se puede elegir el tipo de documento del alumno (DNI / CUIT / CUIL / sin identificar) desde el modal "Emitir Factura AFIP", en vez de pedir siempre CUIT. Factura A (Responsable Inscripto) sigue exigiendo CUIT únicamente, sin selector — es un requisito legal de AFIP, no una limitación de la app.
  - El documento se guarda en el perfil del alumno (`document`/`cuit`) y se precarga automáticamente la próxima vez.
  - Cada factura guarda una foto (`docType`/`docNumber`) de qué documento se usó realmente al emitirla, para que el PDF se pueda volver a generar más adelante con los mismos datos aunque el alumno cambie su perfil después.

### Corregido
- **Crash al abrir el selector de "Artículo"** en los formularios de Informar ingreso/egreso cuando el artículo no tenía una categoría asignada. Ahora se muestra sin la etiqueta de categoría en vez de romper toda la pantalla.
- La descarga/reenvío por email de una factura ya emitida ahora reconstruye el documento del receptor (DNI/CUIT/CUIL) de forma consistente con lo que realmente se le informó a AFIP al momento de emitirla, en vez de tomarlo siempre del perfil actual del alumno.

### Notas técnicas
- Nuevos tests unitarios para la resolución del tipo de documento a informar a AFIP (`resolveReceptorDoc`).
- Validado extremo a extremo contra el ambiente de homologación de AFIP con un alumno real: Factura B con DNI, CUIL y CUIT, las tres devolvieron CAE válido.

## [1.3.4] - 2026-08-10

### Agregado
- **Facturación AFIP de múltiples movimientos en un solo comprobante.** Se puede seleccionar más de un movimiento en la tabla de Movimientos y emitir una única factura AFIP que los agrupa, con un ítem (concepto + monto) por movimiento y un total.
- Monto y concepto editables al momento de emitir cada factura (antes venían fijos desde el movimiento).

### Corregido
- Se eliminó el cálculo automático de IVA 21% en las facturas AFIP (ni Factura A ni B lo discriminan) — decisión de negocio del equipo contable: los montos informados ya incluyen el IVA.
- Selección de movimientos en la tabla de pagos: se corrigió que se perdiera al cambiar de página, y un loop de selección que hacía parpadear los checkboxes sin parar.
