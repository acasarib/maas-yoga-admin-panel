# Configuración del Servicio de Email

## Descripción

El sistema ahora incluye funcionalidad para enviar automáticamente los recibos de pago por email a los estudiantes después de crear un pago.

## Configuración

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Configuración de email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación
```

### 2. Configuración de Gmail

Si usas Gmail, necesitas:

1. **Habilitar la verificación en dos pasos** en tu cuenta de Google
2. **Generar una contraseña de aplicación**:
   - Ve a Configuración de tu cuenta de Google
   - Seguridad
   - Verificación en dos pasos
   - Contraseñas de aplicación
   - Genera una nueva contraseña para "Correo"
3. **Usa esa contraseña** en la variable `SMTP_PASS`

### 3. Otros Proveedores de Email

Para otros proveedores, ajusta las variables según corresponda:

- **Outlook/Hotmail**: `SMTP_HOST=smtp-mail.outlook.com`
- **Yahoo**: `SMTP_HOST=smtp.mail.yahoo.com`
- **Servidor propio**: Usa la configuración de tu servidor SMTP

## Funcionalidad

### Envío Automático de Recibos

Cuando se crea un pago a través del endpoint `POST /payments`, el sistema:

1. Crea el pago en la base de datos
2. Genera automáticamente el PDF del recibo
3. Envía el recibo por email al estudiante (si tiene email configurado)
4. Registra el envío en los logs

### Logs

El sistema registra:
- Envíos exitosos: `"Recibo enviado por email exitosamente para pago {id}"`
- Errores: `"Error enviando recibo por email para pago {id}: {error}"`
- Estudiantes sin email: `"Estudiante {id} no tiene email configurado"`

### Manejo de Errores

- Si el envío de email falla, **no se interrumpe** el flujo principal de creación del pago
- Los errores se registran en los logs para debugging
- El pago se crea normalmente aunque el email no se envíe

## Pruebas

Para probar el servicio:

1. Asegúrate de que las variables de entorno estén configuradas
2. Crea un pago con un estudiante que tenga email configurado
3. Verifica que el email llegue al estudiante
4. Revisa los logs para confirmar el envío

## Notas Importantes

- El estudiante **debe tener un email válido** en la base de datos
- El envío de email es **asíncrono** y no bloquea la respuesta del API
- Los errores de email no afectan la creación del pago
- Se recomienda usar un email dedicado para el sistema 