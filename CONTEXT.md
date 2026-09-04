# Maas Yoga Admin Panel — Contexto General

Documento de referencia para retomar el desarrollo en futuras sesiones.
Última actualización: Junio 2026.

---

## Solicitudes de cambio (chat de WhatsApp)

Las solicitudes de los usuarios (Nora y equipo) se encuentran en:

```
/WhatsApp Chat - Programa maasyoga/_chat.txt
```

> **Nota:** Esta carpeta está en `.gitignore`, por lo que no se puede leer con herramientas de archivo estándar desde el IDE. Usar `cat` o un script Python para leerlo si es necesario.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express |
| ORM | Sequelize (sync con `alter: true` en dev → auto-migra al agregar campos) |
| Base de datos | MySQL (via Docker) |
| Frontend | React + Tailwind CSS + MUI (Material UI) + Formik |
| Excel export | ExcelJS |
| Pagos | Mercado Pago (SDK) |
| Storage | Google Drive (opcional, configurable por env) |
| Deploy | Docker Compose |

---

## Cómo correr el proyecto

```bash
# Levantar todo con Docker
docker-compose up
```

Usuario de prueba: `email@email.com` / `123`

---

## Variables de entorno clave (`.env`)

```
REACT_APP_BACKEND_HOST=          # URL del backend, incluye trailing slash
DB_HOST / DB_USER / DB_PASS / DB_NAME
GOOGLE_DRIVE_ENABLED=            # true/false
MERCADOPAGO_ACCESS_TOKEN=
```

---

## Estructura del backend

```
backend/
  index.js                        ← Entry point: Express, rutas, cron jobs, DB sync
  app/
    config/
      db.config.js                ← Credenciales DB desde .env
    db/
      index.js                    ← Inicializa Sequelize, carga modelos, define asociaciones
      models/
        student.js                ← Alumno: name, lastName, document, email, phoneNumber,
                                     cellPhoneNumber, contact, image, alias, address,
                                     occupation, coverage, country, province, neighborhood
        course.js                 ← Curso: title, needsRegistration, isCircular,
                                     description, startAt, endAt
        payment.js                ← Pago: type, value, discount, at, operativeResult,
                                     periodFrom, periodTo, driveFileId, verified,
                                     isRegistrationPayment, note
        courseStudent.js          ← Join table: student ↔ course (+ inscriptionDate)
        courseStudentSuspend.js   ← Suspensiones: studentId, courseId,
                                     suspendedAt, suspendedEndAt
        professor.js              ← Profesor
        professorCourse.js        ← Join: profesor ↔ curso (con períodos y criterio de pago)
        payment.js                ← Ver arriba
        item.js / category.js     ← Artículos y categorías para egresos
        clazz.js                  ← Clases (distintas de cursos)
        user.js                   ← Usuario del sistema (login)
        mercadoPagoPayment.js     ← Pagos MP asociados a pagos del sistema
        secretaryPayment.js       ← Desglose de sueldo de secretaria
        servicePayment.js         ← Pagos de servicios
        task.js / courseTask.js / studentCourseTask.js ← Sistema de tareas
    controllers/                  ← Un controller por entidad, llaman a services
    routes/                       ← Un router por entidad
    services/
      studentService.js           ← Lógica compleja de alumnos y estado de pagos
      courseService.js            ← Cursos, cálculo de pagos de profesores, exports Excel
      paymentService.js           ← Pagos, balance, exports
      mercadoPagoService.js       ← Integración MP (links, QR, webhooks)
      emailService.js             ← Envío de emails (nodemailer)
      professorService.js         ← Lógica de profesores
      userService.js              ← Auth y usuarios
    utils/
      constants.js                ← Constantes críticas (ver sección abajo)
      functions.js                ← dateToYYYYMMDD, dateToDDMMYYYY, series, getMonthName...
    middleware/
      verifyToken.js              ← JWT auth middleware
```

---

## Estructura del frontend

```
frontend/src/
  constants.js                    ← STUDENT_MONTHS_CONDITIONS, STUDENT_STATUS,
                                     PAYMENT_OPTIONS, COLORS, APP_VERSION
  context/Context.js              ← Provider global: students, courses, professors,
                                     payments, alerts, helpers
  pages/
    students.jsx                  ← Lista de alumnos + modal alta/edición/eliminación
    studentDetail.jsx             ← Perfil, pagos, cursos y tareas de un alumno
    courseDetail.jsx              ← Detalle de curso: profesores, alumnos, tareas
    courses.jsx                   ← Lista de cursos
    balance.jsx                   ← Movimientos + Reportes (tabs), gráficos, exports
    payments.jsx                  ← Listado general de pagos
    consultaPagos.jsx             ← Consulta avanzada de pagos
    professorDetail.jsx           ← Detalle de profesor
    professorPaymentCalculation.jsx ← Cálculo de pagos a profesores
    home.jsx                      ← Dashboard principal
    newUser.jsx                   ← Alta/edición de usuarios del sistema
    ...
  services/
    studentsService.js            ← API calls: newStudent, editStudent, getStudents,
                                     getStudentsByCourse, pendingPayments...
    coursesService.js             ← API calls: getCourse, exportStudents,
                                     exportProfessorsPayments...
    paymentsService.js            ← API calls para pagos
  components/
    section/courses/
      studentCoursesInfo.js       ← Ícono de estado de pago en grilla de cursos
                                     (rojo=pendiente, verde=al día, amarillo=suspendido)
    calendar/
      studentCalendar.jsx         ← Vista mensual de pagos de un alumno en un curso
                                     (badges clicables para abrir modal de pago)
    card/
      studentCard.jsx             ← Perfil visual del alumno (Nombre, Email, Tel,
                                     Documento, Fecha registro, País, Provincia, Barrio)
    modal/
      paymentModal.jsx            ← Modal para informar/editar pagos con MP
      suspensionsModal.jsx        ← Modal para gestionar suspensiones de alumnos
    table/
      studentsTable (dentro de courseDetail) ← Tabla de alumnos en un curso
    ...
```

---

## Constantes críticas

### `backend/app/utils/constants.js` y `frontend/src/constants.js`

```js
STUDENT_MONTHS_CONDITIONS = {
  PAID:              "PAID",           // El alumno pagó ese mes
  NOT_PAID:          "NOT_PAID",       // Debía pagar y no pagó
  PENDING:           "PENDING",        // Pago generado pero no confirmado
  SUSPEND:           "SUSPEND",        // Alumno suspendido ese mes
  NOT_TAKEN:         "NOT_TAKEN",      // Mes fuera del rango activo del curso
  CIRCULAR_NOT_PAID: "CIRCULAR_NOT_PAID", // No pagó en curso circular
}

STUDENT_STATUS = {
  ACTIVE:  "ACTIVE",   // No suspendido en el mes actual
  SUSPEND: "SUSPEND",  // Suspendido en el mes actual
}

PAYMENT_TYPES = { ... }   // Tipos de egreso/ingreso para pagos de profesores

CRITERIA_COURSES = {
  PERCENTAGE: ...,       // Profesor cobra % de la recaudación
  FIXED: ...,            // Fijo mensual
  PERCENTAGE_ASSISTANCE: ...,
  ...
}
```

---

## Lógica de negocio principal

### Estado de pago de un alumno (`studentService.js → getStudentsByCourse`)

Para cada alumno inscrito en un curso:
1. Se genera una serie de meses desde `startAt` del curso hasta `endAt`.
2. Por cada mes se busca si existe un pago (`payment`) del alumno para ese curso/período.
3. Se compara la fecha de inscripción del alumno (`courseStudent.inscriptionDate`) para no cobrar meses previos a su ingreso.
4. Si el alumno tiene una suspensión activa (`courseStudentSuspend`) para ese mes, el estado es `SUSPEND`.
5. Se calcula `currentMonth`: el estado del **mes actual**. Si el curso no empezó o ya terminó, `currentMonth = NOT_TAKEN`.

**Regla de ícono en la grilla de cursos** (`studentCoursesInfo.js`):
- 🔴 Rojo → tiene meses `NOT_PAID` en el pasado/presente, O bien el curso es futuro y tiene meses `NOT_PAID` sin pagar
- 🟢 Verde → al día (o curso futuro sin meses pendientes)
- 🟡 Amarillo → suspendido este mes

### Cursos circulares (`isCircular: true`)
Los cursos circulares no tienen fecha de fin. El estado de pago se calcula de forma diferente: `pendingPayments.circular = true/false`.

### Registro (`needsRegistration: true`)
Cursos que requieren un pago de matrícula separado (`isRegistrationPayment: true` en el payment).

### Exportación Excel de profesores (`courseService.js → exportProfessorsPayments`)
Genera un Excel con el detalle de pagos calculados para cada profesor, agrupado por período.

### Exportación Excel de inscriptos (`courseService.js → exportStudentsByCourse`)
Genera un Excel con: N°, Nombre, Apellido, Email, Teléfono, Documento, Fecha de inscripción, Estado (Activo/Suspendido).
Endpoint: `GET /api/v1/courses/:courseId/export-students`

---

## Relaciones entre modelos (Sequelize)

```
student ──────< courseStudent >────── course
                    │
               inscriptionDate

student ──────< courseStudentSuspend > ── course
                suspendedAt / suspendedEndAt

student ──────< payment >────────────── course
                                         │
                                       professor

course ───────< professorCourse >──── professor
                periods (JSON), criteria, criteriaValue

payment ──── item ──── category
payment ──── file (comprobante)
payment ──── mercadoPagoPayment
payment ──── secretaryPayment

course ──────< courseTask >──────── student (via studentCourseTask)
```

---

## Rutas API relevantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/students` | Lista paginada con filtros |
| POST | `/api/v1/students` | Crear alumno |
| PUT | `/api/v1/students/:id` | Editar alumno |
| DELETE | `/api/v1/students/:id` | Eliminar alumno |
| GET | `/api/v1/students/courses/:courseId` | Alumnos de un curso con estado de pago |
| PUT | `/api/v1/students/:studentId/courses/:courseId/suspend` | Suspender alumno |
| DELETE | `/api/v1/students/:studentId/courses/:courseId/suspend` | Quitar suspensión |
| GET | `/api/v1/students/:id/payments/pending` | Pagos pendientes de un alumno |
| GET | `/api/v1/courses/:id` | Detalle de curso |
| PUT | `/api/v1/courses/:id/students` | Asignar alumnos a curso |
| GET | `/api/v1/courses/:courseId/export-students` | ⬇️ Excel inscriptos |
| POST | `/api/v1/export-professors-payments` | ⬇️ Excel pagos profesores |
| POST | `/api/v1/calc-professors-payments` | Calcular pagos profesores |
| POST | `/api/v1/payments` | Registrar pago |
| GET | `/api/v1/payments` | Listado de pagos |

---

## Pendiente para futuras sesiones

---

## Notas de arquitectura importantes

- **No hay migraciones manuales:** Sequelize usa `sync({ alter: true })`. Al agregar campos al modelo y reiniciar el backend, la DB se actualiza automáticamente en desarrollo.
- **El Context global** (`Context.js`) centraliza estado de `students`, `courses`, `professors`, `payments`. Los componentes consumen mediante `useContext`.
- **Todos los exports Excel** siguen el mismo patrón: service devuelve buffer → controller setea headers → frontend recibe blob → crea URL temporal → descarga.
- **Pagos de profesores** tienen criterios configurables por período dentro del curso (porcentaje de recaudación, fijo, porcentaje por asistencia).
- **Mercado Pago** está integrado con webhooks. Los pagos MP se asocian a payments del sistema mediante `mercadoPagoPayment`.
