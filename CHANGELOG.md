# Changelog

Todas las versiones notables de este proyecto se documentan en este archivo.

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
