# API Keys - Diseño de Sistema

## Resumen Ejecutivo

Para integración con terceras apps, se recomienda crear una entidad **API Key** que:
- Actúe como "usuario automatizado" vinculado a un usuario real
- Tenga permisos granulares independientes de roles tradicionales
- Sea deshabilitada/habilitada sin eliminarla
- Audite todas las operaciones a su nombre

**No** se recomienda crear un nuevo rol. Mejor: un usuario especial + permiso granular por API Key.

---

## Problema y Motivación

Actualmente el sistema tiene roles (operador, auditor). Pero para una tercera app:
- No queremos dar acceso de operador (muy permisivo)
- No queremos dar acceso de auditor (muy restrictivo)
- Queremos control fino: "esta app puede crear/actualizar pagos, pero NO puede eliminar usuarios"
- Queremos que cada integración tenga su propia credencial y permisos
- Queremos auditar quién hizo qué (saber que fue "app X" vía su API key)

**Solución:** API Keys como credenciales de servicio con permisos a la carta.

---

## Arquitectura Propuesta

### 1. Entidad `ApiKey`

```sql
CREATE TABLE api_keys (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Credencial
  key_prefix VARCHAR(20) NOT NULL UNIQUE,           -- e.g. "sk_prod_abc123xyz" (first 20 chars)
  key_hash VARCHAR(255) NOT NULL UNIQUE,             -- bcrypt hash de la key completa
  
  -- Metadata
  name VARCHAR(255),                                 -- e.g. "Sistema X - Pagos"
  description TEXT,
  status ENUM('active', 'disabled', 'revoked'),     -- active: opera, disabled: no opera pero existe, revoked: nunca va a volver
  
  -- Permisos granulares (JSON)
  permissions JSON NOT NULL,                         -- ej: ["payment:create", "payment:read", "payment:update"]
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,                              -- Opcional: rotación forzada de keys
  
  -- Para renovación
  rotated_from BIGINT REFERENCES api_keys(id),       -- Ref a la key anterior si fue rotada
  
  created_by BIGINT REFERENCES users(id),            -- Quién la creó
  
  INDEX (user_id),
  INDEX (key_prefix),
  INDEX (status)
);
```

### 2. Estructura de Permisos

En lugar de roles, usar namespaced permissions tipo OAuth scopes:

```json
[
  "payment:create",
  "payment:read",
  "payment:update",
  "student:read",
  "course:read",
  "course:update"
]
```

Catálogo de permisos disponibles (en `backend/app/utils/apiKeyPermissions.js`):

```js
export const API_KEY_PERMISSIONS = {
  // Pagos
  'payment:create': 'Crear pagos',
  'payment:read': 'Leer pagos',
  'payment:update': 'Actualizar pagos',
  'payment:delete': 'Eliminar pagos',
  'payment:emit': 'Emitir facturas (AFIP)',
  
  // Estudiantes
  'student:read': 'Leer estudiantes',
  'student:create': 'Crear estudiantes',
  'student:update': 'Actualizar estudiantes',
  
  // Cursos
  'course:read': 'Leer cursos',
  'course:create': 'Crear cursos',
  'course:update': 'Actualizar cursos',
  
  // Profesores
  'professor:read': 'Leer profesores',
  
  // ... más según necesidad
};
```

### 3. Usuario Asociado a la API Key

La `api_keys.user_id` apunta a un usuario. Opciones:

**Opción A: Usuario real existente**
- Pro: Auditoría clara, usuario es una persona responsable
- Contra: Esa persona recibe notificaciones, etc
- Caso: Gerente técnico de la app tercera

**Opción B: Usuario especial tipo "service account"**
- Pro: Claramente diferenciado (ej: `service_external_app_x@myapp`)
- Contra: Requiere lógica especial (no puede hacer login web, etc)
- Caso: Integración pura sin persona responsable
- Recomendado para este proyecto

Sugerencia: crear un usuario con `email = "api:external-app-name"` y `role = 'service'` (nuevo rol especial).

---

## Implementación

### Backend

#### 1. Modelo Sequelize (`backend/app/db/models/ApiKey.js`)

```js
export default (sequelize, DataTypes) => {
  const ApiKey = sequelize.define('ApiKey', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false, references: { model: 'users', key: 'id' } },
    key_prefix: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    key_hash: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255) },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('active', 'disabled', 'revoked'), defaultValue: 'active' },
    permissions: { type: DataTypes.JSON, allowNull: false },
    expires_at: { type: DataTypes.DATE },
    last_used_at: { type: DataTypes.DATE },
    rotated_from: { type: DataTypes.BIGINT },
    created_by: { type: DataTypes.BIGINT },
  }, { tableName: 'api_keys' });

  ApiKey.associate = (models) => {
    ApiKey.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    ApiKey.belongsTo(models.User, { foreignKey: 'created_by', as: 'createdBy' });
  };

  return ApiKey;
};
```

#### 2. Middleware de Autenticación (`backend/app/middleware/verifyApiKey.js`)

```js
import bcrypt from 'bcryptjs';
import db from '../db/index.js';

export const verifyApiKey = async (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];
  
  if (!apiKeyHeader) {
    return res.status(401).json({ message: 'API Key required in X-Api-Key header' });
  }

  try {
    // Buscar by prefix para no mantener la key en plain en memoria
    const [keyPrefix] = apiKeyHeader.split('.').slice(0, 1);
    const apiKey = await db.ApiKey.findOne({
      where: { key_prefix: keyPrefix, status: 'active' },
      include: [{ model: db.User, as: 'user' }],
    });

    if (!apiKey) {
      return res.status(401).json({ message: 'Invalid or disabled API Key' });
    }

    // Verificar hash
    const isValid = await bcrypt.compare(apiKeyHeader, apiKey.key_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid API Key' });
    }

    // Verificar expiración
    if (apiKey.expires_at && new Date() > apiKey.expires_at) {
      return res.status(401).json({ message: 'API Key expired' });
    }

    // Actualizar last_used_at
    await apiKey.update({ last_used_at: new Date() });

    // Adjuntar a req
    req.user = apiKey.user;
    req.apiKey = apiKey;
    req.permissions = apiKey.permissions;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};
```

#### 3. Middleware de Autorización (`backend/app/middleware/authorizeApiKey.js`)

```js
export const authorizeApiKey = (requiredPermissions = []) => {
  return (req, res, next) => {
    // Solo aplica si vinieron via API Key
    if (!req.apiKey) {
      return next(); // JWT o cookies pasan sin validar
    }

    const userPermissions = req.permissions || [];
    const hasAllPermissions = requiredPermissions.every(perm => 
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        required: requiredPermissions,
        granted: userPermissions,
      });
    }

    next();
  };
};
```

#### 4. Servicio de API Keys (`backend/app/services/apiKeyService.js`)

```js
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';

export const generateApiKey = async (userId, name, permissions, expiresAt = null) => {
  // Generar key: formato "sk_prod_<random>"
  const keyRandom = crypto.randomBytes(24).toString('hex');
  const fullKey = `sk_prod_${keyRandom}`;
  const keyPrefix = fullKey.slice(0, 20);
  
  // Hash la key
  const keyHash = await bcrypt.hash(fullKey, 10);

  // Crear registro
  const apiKey = await db.ApiKey.create({
    user_id: userId,
    key_prefix: keyPrefix,
    key_hash: keyHash,
    name,
    permissions,
    expires_at: expiresAt,
  });

  return { apiKey, fullKey }; // Retornar fullKey solo una vez
};

export const listApiKeys = async (userId) => {
  return db.ApiKey.findAll({
    where: { user_id: userId },
    attributes: {
      exclude: ['key_hash'], // No exponer hash
    },
    order: [['created_at', 'DESC']],
  });
};

export const disableApiKey = async (apiKeyId) => {
  return db.ApiKey.update({ status: 'disabled' }, { where: { id: apiKeyId } });
};

export const rotateApiKey = async (apiKeyId, newPermissions = null) => {
  const oldKey = await db.ApiKey.findByPk(apiKeyId);
  if (!oldKey) throw new Error('API Key not found');

  // Generar nueva key
  const keyRandom = crypto.randomBytes(24).toString('hex');
  const fullKey = `sk_prod_${keyRandom}`;
  const keyPrefix = fullKey.slice(0, 20);
  const keyHash = await bcrypt.hash(fullKey, 10);

  // Crear nueva, marcar antigua como rotated
  const newKey = await db.ApiKey.create({
    user_id: oldKey.user_id,
    key_prefix: keyPrefix,
    key_hash: keyHash,
    name: oldKey.name,
    permissions: newPermissions || oldKey.permissions,
    rotated_from: oldKey.id,
  });

  // Deshabilitar anterior
  await oldKey.update({ status: 'disabled' });

  return { newKey, fullKey };
};
```

#### 5. Endpoints de Administración de Keys (`backend/app/routes/apiKeysRoutes.js`)

```js
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyApiKey } from '../middleware/verifyApiKey.js';
import * as apiKeyService from '../services/apiKeyService.js';
import { API_KEY_PERMISSIONS } from '../utils/apiKeyPermissions.js';

const router = express.Router();

// Listar keys de un usuario (protegido por JWT)
router.get('/my-keys', verifyToken, async (req, res) => {
  try {
    const keys = await apiKeyService.listApiKeys(req.user.id);
    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear nueva key (protegido por JWT)
router.post('/generate', verifyToken, async (req, res) => {
  const { name, permissions } = req.body;
  
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ message: 'permissions must be an array' });
  }

  // Validar que los permisos existan
  const validPerms = Object.keys(API_KEY_PERMISSIONS);
  const invalid = permissions.filter(p => !validPerms.includes(p));
  if (invalid.length) {
    return res.status(400).json({ message: `Invalid permissions: ${invalid.join(', ')}` });
  }

  try {
    const { apiKey, fullKey } = await apiKeyService.generateApiKey(
      req.user.id,
      name,
      permissions
    );
    // Solo mostrar la key completa una vez en la respuesta
    res.json({ apiKey, secret: fullKey });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deshabilitar key
router.post('/:id/disable', verifyToken, async (req, res) => {
  try {
    await apiKeyService.disableApiKey(req.params.id);
    res.json({ message: 'API Key disabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rotar key
router.post('/:id/rotate', verifyToken, async (req, res) => {
  const { permissions } = req.body;
  try {
    const { newKey, fullKey } = await apiKeyService.rotateApiKey(
      req.params.id,
      permissions
    );
    res.json({ newKey, secret: fullKey });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint público: listar permisos disponibles
router.get('/available-permissions', (req, res) => {
  res.json(API_KEY_PERMISSIONS);
});

export default router;
```

#### 6. Proteger rutas con API Key

En los controllers, usar el middleware:

```js
import { authorizeApiKey } from '../middleware/authorizeApiKey.js';

// En routes
router.post('/payments', 
  [verifyToken, verifyApiKey], // Aceptar JWT o API Key
  authorizeApiKey(['payment:create']),
  paymentController.create
);
```

---

## Frontend

### Página de Gestión de API Keys

Ubicación: `frontend/src/pages/ApiKeysManagement.jsx`

Funcionalidades:
- **Listar** keys existentes (sin mostrar el hash, claro)
- **Crear** nueva key: elegir nombre + permisos de un checklist
- **Ver última vez usada** (para detectar claves olvidadas)
- **Deshabilitar** keys sin eliminarlas
- **Rotar** keys: generar nueva, mostrar el secreto una sola vez
- **Copiar a clipboard** el secreto

Ejemplo de UI (con MUI):
```jsx
const [permissions, setPermissions] = useState([]);

<FormControlLabel
  label="Payment: Create"
  control={
    <Checkbox
      checked={permissions.includes('payment:create')}
      onChange={(e) => handlePermissionToggle('payment:create')}
    />
  }
/>
```

---

## Consideraciones de Seguridad

### Generación de Keys
- ✅ Usar `crypto.randomBytes(24)` (192 bits de entropía)
- ✅ Prefijo público (`sk_prod_...`) para debugging, el secreto nunca se repite
- ✅ Hash la clave completa en BD (bcrypt), nunca almacenar plaintext

### Almacenamiento
- ✅ Nunca loguear la key completa
- ✅ Mostrar la key completa al usuario **solo una vez** (en la respuesta de creación)
- ✅ Si se pierde, forzar rotación

### Validación
- ✅ Rate-limit en intentos fallidos (para evitar brute force)
- ✅ Expiración opcional (renovación forzada cada 90 días, por ejemplo)
- ✅ Auditar cada uso en un log de accesos

### Revocación
- ✅ `status = 'disabled'` pausa sin eliminar (útil para rotación)
- ✅ `status = 'revoked'` indica que nunca volverá (compromiso de seguridad)

---

## Flujo de Ejemplo: App Tercera Crea Pago

1. **Gerente de App X genera una API Key desde el panel:**
   - Nombre: "Sistema Reservas - Pagos"
   - Permisos: `['payment:create', 'payment:read', 'student:read']`
   - Recibe: `sk_prod_abc123...` (una sola vez)

2. **App X guarda la key en su `.env`:** `MAAS_API_KEY=sk_prod_abc123...`

3. **App X crea un pago:**
   ```bash
   curl -X POST https://api.myapp.com/api/v1/payments \
     -H "X-Api-Key: sk_prod_abc123..." \
     -H "Content-Type: application/json" \
     -d '{ "studentId": 42, "amount": 5000, ... }'
   ```

4. **Backend:**
   - `verifyApiKey` extrae y valida la key
   - `req.user` = usuario asociado a esa key (ej: "api:external-app-x")
   - `req.permissions` = `['payment:create', 'payment:read', 'student:read']`
   - `authorizeApiKey(['payment:create'])` pasa ✅
   - Controlador crea pago, registra en auditoría quién fue (el usuario de la API key)

5. **Auditoría:**
   - En `payment.created_by` o log: "api:external-app-x" (vía su API key)
   - Admin ve en panel: "esta key fue usada por última vez hace 2 minutos"

---

## Ventajas de este Enfoque

| Característica | Beneficio |
|---|---|
| **Granulares** | No es "todo o nada" como roles; control fino |
| **Auditables** | Sé exactamente qué app hizo qué |
| **Rotables** | Cambiar la key sin perder historia |
| **Escalables** | N apps = N keys con permisos independientes |
| **Seguros** | Hashing, expiración, revocación |
| **Aislados** | Una key comprometida no afecta otras |

---

## Roadmap de Implementación

1. **Fase 1: Modelo + Middleware**
   - [ ] Crear tabla `api_keys`
   - [ ] Implementar `verifyApiKey` middleware
   - [ ] Implementar `authorizeApiKey` middleware

2. **Fase 2: Servicios y Endpoints**
   - [ ] `apiKeyService.js` (generar, listar, deshabilitar, rotar)
   - [ ] Rutas CRUD para API keys

3. **Fase 3: Frontend**
   - [ ] Página de gestión de keys
   - [ ] Integrar en usuario settings/profile

4. **Fase 4: Adopción**
   - [ ] Anotar rutas que acepten API keys
   - [ ] Documentar en OpenAPI/Swagger
   - [ ] Testear con cliente tercero real

5. **Fase 5: Opcional**
   - [ ] Rate limiting por API key
   - [ ] Logs de auditoría detallados
   - [ ] Alertas cuando una key vieja no se usa

---

## Preguntas para Validar

- ¿La app tercera puede almacenar de forma segura una API key en `.env`?
- ¿Queremos expiración automática de keys (ej: cada 90 días)?
- ¿Necesitamos rate limiting por API key?
- ¿Los permisos propuestos son suficientes o hay más granularidad requerida?
