# Plan de Integración Swagger - Backend Node.js Express.js

## Resumen
Integración de Swagger/OpenAPI para documentación pública de la API REST del backend de maas-yoga-admin-panel.

## Stack a Utilizar
- **swagger-ui-express**: Middleware para servir la UI de Swagger
- **swagger-jsdoc**: Generación automática de documentación desde comentarios JSDoc
- **YAML**: Formato para archivo de configuración Swagger (opcional)

## Fases de Implementación

### Fase 1: Instalación y Configuración Básica

#### 1.1 Instalar dependencias
```bash
npm install swagger-ui-express swagger-jsdoc
```

#### 1.2 Crear archivo de configuración Swagger
Crear `backend/app/config/swaggerConfig.js` con:
- Configuración básica de swagger-jsdoc
- Definición de la API (info, title, version, description)
- Rutas a escanear para documentación
- Servidor URL (dinámico desde variables de entorno)

#### 1.3 Integrar middleware en Express
Modificar `backend/index.js`:
- Importar swagger-ui-express y swagger-jsdoc
- Importar configuración swagger
- Agregar endpoint `/api-docs` para servir la UI de Swagger
- Configurar para acceso público (sin autenticación)

### Fase 2: Documentación de Estructura Global

#### 2.1 Definir esquemas comunes
Crear `backend/app/docs/schemas/common.js` con:
- Schema de respuesta estándar (success, error)
- Schema de paginación
- Schema de errores comunes

#### 2.2 Definir tags por módulo
Tags para agrupar endpoints:
- Users
- Courses
- Students
- Payments
- Files
- Tasks
- Headquarters
- Templates
- Categories
- Classes (Clazzes)
- Professors
- Logs
- Notifications

#### 2.3 Configurar autenticación JWT
Definir security scheme Bearer JWT:
- Tipo: http
- Esquema: bearer
- Formato: JWT
- Descripción de cómo obtener el token

### Fase 3: Documentación de Endpoints por Módulo

#### 3.1 Prioridad alta (endpoints críticos)
Documentar primero los endpoints más utilizados:
- **Users**: login, register, getById, update
- **Students**: getAll, create, update, getById
- **Courses**: getAll, create, update, getById
- **Payments**: getAll, create, update

#### 3.2 Prioridad media
- **Headquarters**: CRUD completo
- **Professors**: CRUD completo
- **Categories**: CRUD completo
- **Classes**: CRUD completo

#### 3.3 Prioridad baja
- **Files**: upload, download
- **Tasks**: CRUD completo
- **Templates**: CRUD completo
- **Logs**: getAll
- **Notifications**: getAll, create

### Fase 4: Documentación Detallada por Endpoint

Para cada endpoint incluir:

#### 4.1 Comentarios JSDoc en Routes
Ejemplo de estructura:
```javascript
/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: Obtener todos los estudiantes
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *     responses:
 *       200:
 *         description: Lista de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
```

#### 4.2 Elementos a documentar
- **summary**: Descripción corta del endpoint
- **description**: Descripción detallada (opcional)
- **tags**: Agrupación por módulo
- **security**: Requerimientos de autenticación
- **parameters**: Query params, path params
- **requestBody**: Body para POST/PUT/PATCH
- **responses**: Códigos de respuesta y schemas
- **examples**: Ejemplos de request/response

### Fase 5: Definición de Schemas

#### 5.1 Crear schemas por entidad
Crear `backend/app/docs/schemas/` con archivos:
- `user.js`: Schema de User
- `student.js`: Schema de Student
- `course.js`: Schema de Course
- `payment.js`: Schema de Payment
- `headquarter.js`: Schema de Headquarter
- `professor.js`: Schema de Professor
- `category.js`: Schema de Category
- `clazz.js`: Schema de Clazz
- etc.

#### 5.2 Estructura de schema
```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del estudiante
 *         name:
 *           type: string
 *           description: Nombre completo
 *         email:
 *           type: string
 *           format: email
 *           description: Email del estudiante
 */
```

### Fase 6: Configuración de Acceso Público

#### 6.1 Configurar CORS para Swagger
Asegurar que el endpoint `/api-docs` sea accesible públicamente:
- Verificar configuración CORS en `index.js`
- Agregar `/api-docs` a allowed origins si es necesario

#### 6.2 Variables de entorno
Agregar en `.env`:
```bash
SWAGGER_ENABLED=true
SWAGGER_SERVER_URL=http://localhost:3000
```

#### 6.3 Configuración por entorno
- **Development**: Swagger habilitado, servidor local
- **Production**: Swagger habilitado, servidor de producción

### Fase 7: Validación y Testing

#### 7.1 Verificar documentación
- Acceder a `/api-docs`
- Validar que todos los endpoints aparecen
- Probar "Try it out" en endpoints de ejemplo

#### 7.2 Validar schemas
- Verificar que los schemas son correctos
- Validar ejemplos de request/response
- Verificar referencias entre schemas

#### 7.3 Validar autenticación
- Probar endpoint sin token (debe fallar 401)
- Probar endpoint con token válido
- Verificar que el botón "Authorize" funciona

### Fase 8: Mantenimiento y Buenas Práciicas

#### 8.1 Estándares de documentación
- Documentar cada nuevo endpoint inmediatamente
- Actualizar documentación al modificar endpoints
- Usar descripciones claras y concisas
- Incluir ejemplos reales cuando sea posible

#### 8.2 Revisión periódica
- Revisar documentación mensualmente
- Eliminar endpoints obsoletos
- Actualizar schemas si cambian los modelos

#### 8.3 Automatización (opcional)
- Script para validar que todos los endpoints están documentados
- Test automatizado que verifica que Swagger responde correctamente
- Integración con CI/CD para validar documentación

## Estructura de Archivos Propuesta

```
backend/
├── app/
│   ├── config/
│   │   └── swaggerConfig.js          # Configuración de Swagger
│   ├── docs/
│   │   ├── schemas/
│   │   │   ├── common.js             # Schemas comunes
│   │   │   ├── user.js               # Schema User
│   │   │   ├── student.js            # Schema Student
│   │   │   ├── course.js             # Schema Course
│   │   │   ├── payment.js            # Schema Payment
│   │   │   └── ...                   # Resto de schemas
│   │   └── index.js                  # Export de todos los schemas
│   └── routes/
│       ├── usersRoute.js             # Con comentarios JSDoc
│       ├── studentsRoute.js          # Con comentarios JSDoc
│       └── ...                       # Resto de routes con JSDoc
├── index.js                           # Integración de Swagger UI
└── package.json                       # Dependencias agregadas
```

## Consideraciones Específicas del Proyecto

### Autenticación JWT
- El proyecto usa JWT para autenticación
- Configurar Bearer Auth en Swagger
- Documentar cómo obtener el token (endpoint `/api/v1/users/login`)

### Validación con express-validator
- Documentar los requisitos de validación
- Incluir ejemplos de errores de validación en responses

### Multipart/form-data (uploads)
- Documentar endpoints que usan multer
- Incluir ejemplos de file upload

### SSL/HTTPS
- El proyecto soporta SSL
- Configurar Swagger para usar HTTPS en producción

## Tiempos Estimados

- **Fase 1**: 1-2 horas
- **Fase 2**: 2-3 horas
- **Fase 3**: 8-12 horas (dependiendo de cantidad de endpoints)
- **Fase 4**: Incluido en Fase 3
- **Fase 5**: 4-6 horas
- **Fase 6**: 1 hora
- **Fase 7**: 2-3 horas
- **Total**: 18-27 horas

## Recursos Útiles

- [Swagger UI Express Documentation](https://github.com/scottie1984/swagger-ui-express)
- [Swagger JSDoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)
