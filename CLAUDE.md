# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Admin panel for a yoga studio (Maas Yoga): manages students, courses, professors, payments (including Mercado Pago and AFIP electronic invoicing), and payroll calculations. Monorepo with a Node/Express backend and a Create React App frontend, run via Docker Compose.

There is also a `CONTEXT.md` at the repo root — a detailed (Spanish-language) architecture/business-logic reference written for continuity across sessions. Read it for deep business-logic detail, but note it says the DB is MySQL; that is stale — **the DB is PostgreSQL** (`backend/app/config/db.config.js` sets `dialect: "postgres"`, and `docker-compose.yml` uses the `postgres` image).

## Commands

### Run everything (Docker — normal workflow)
```bash
docker-compose up
```
Test login: `email@email.com` / `123` (seeded by `backend/app/seeders/firstUserSeed.js` on boot).

### Backend (without Docker)
```bash
cd backend
npm i
npm run dev      # nodemon index.js
npm start        # node --trace-deprecation index.js
```
Backend is an ES module (`"type": "module"` in package.json) — use `import`/`export`, not `require`.

### Frontend (without Docker)
```bash
cd frontend
npm i
npm start                # react-scripts start
npm run start-docker     # with WATCHPACK_POLLING (used inside the container)
npm run build
npm test                  # react-scripts test (Jest) — react-app/react-app/jest eslint config
```

### Linting
- Backend: `eslintrc.json` extends `eslint:recommended`, 2-space indent, double quotes, required semicolons (`no-unused-vars` is off).
- Frontend: CRA's built-in `react-app` / `react-app/jest` eslint config.

There is no dedicated backend test suite; the frontend has only the CRA default `App.test.js`.

## Architecture

### Backend (`backend/app/`)
Layered Express app: `routes/` → `controllers/` → `services/` → Sequelize `db/models/`.

- `index.js` — entry point: sets up Express, CORS, mounts `routes/index.js` at `/api/v1`, runs `sequelize.sync({ alter: true })` on boot (⚠️ **no manual migrations** — adding/changing a model field auto-alters the DB schema on next restart in dev), seeds the first user, schedules a daily cron (`node-cron`, 1am) via `app/client/scheduledCronTasks.js` (`addTodayPaymentServices`), and optionally serves HTTPS if `USE_SSL_CERTIFICATE=true`.
- `db/index.js` — initializes Sequelize, loads all models in `db/models/`, wires associations.
- `config/db.config.js` — Postgres connection config from `POSTGRES_*` env vars.
- `middleware/verifyToken.js` — JWT auth guard used on protected routes.
- `services/` — where the real business logic lives; controllers stay thin. Key services:
  - `studentService.js` — student CRUD and per-course payment-status computation (see below).
  - `courseService.js` — courses, professor payment calculation, Excel exports.
  - `paymentService.js` — payments, balance, exports.
  - `mercadoPagoService.js` — Mercado Pago links/QR/webhooks.
  - `afipService.js` — AFIP WSAA/WSFE electronic invoicing (CAE issuance), guarded against double-emission via the payment's `cae`.
  - `emailService.js` — nodemailer, uses templates in `app/templates/` (e.g. `invoice_email.html`).
  - `headquarterService.js` — multi-location (headquarters) support.
- `utils/constants.js` — critical shared enums (see below).
- `utils/functions.js` — date helpers (`dateToYYYYMMDD`, `dateToDDMMYYYY`, month-range `series`, etc.) used throughout the payment-status logic.

### Frontend (`frontend/src/`)
CRA app using Tailwind + MUI (Material/Joy) + Formik, with a global Context provider instead of Redux.

- `context/Context.js` — global provider holding `students`, `courses`, `professors`, `payments`, alerts, and shared helpers; consumed via `useContext` throughout.
- `services/*.js` — one file per API resource (axios calls), mirroring backend routes (e.g. `studentsService.js`, `coursesService.js`, `paymentsService.js`).
- `pages/*.jsx` — route-level screens (students list/detail, course list/detail, balance/reports, payments, professor detail & payment calculation, home dashboard).
- `components/section/courses/studentCoursesInfo.js` — renders the payment-status icon in course grids (see rules below).
- `constants.js` — mirrors backend constants (`STUDENT_MONTHS_CONDITIONS`, `STUDENT_STATUS`, `PAYMENT_OPTIONS`, `COLORS`, `APP_VERSION`).

### Shared enums (`backend/app/utils/constants.js` and `frontend/src/constants.js` — keep in sync when editing either)
```js
STUDENT_MONTHS_CONDITIONS = { PAID, NOT_TAKEN, NOT_PAID, PENDING, SUSPEND }  // per-month payment state for a student in a course
STUDENT_STATUS = { ACTIVE, SUSPEND }                                        // student status in the current month
CRITERIA_COURSES = { ... }  // how a professor is paid for a course: percentage of revenue, fixed, percentage by attendance, ...
```

### Core business logic: student payment status
`studentService.js` (`getStudentsByCourse`) computes, per student per course:
1. Generate the month series from the course's `startAt` to `endAt`.
2. For each month, look up whether a matching `payment` exists for that student/course/period.
3. Skip months before the student's `courseStudent.inscriptionDate`.
4. If a `courseStudentSuspend` record covers that month, status is `SUSPEND`.
5. `currentMonth` reflects the current month specifically; if the course hasn't started or already ended, it's `NOT_TAKEN`.

Grid icon rule (`studentCoursesInfo.js`): red = has an unpaid past/present month (or is a future course with unpaid months already due), green = up to date, yellow = suspended this month.

Two course modifiers change this logic:
- `isCircular: true` — no end date; pending-payment status is computed differently (`pendingPayments.circular`).
- `needsRegistration: true` — course requires a separate registration payment (`payment.isRegistrationPayment: true`).

### AFIP invoicing
Electronic invoicing (CAE) is only offered for specific payment types (`INVOICEABLE_TYPES` in `paymentsTable/index.jsx`: Mercado Pago, Transferencia, Tarjeta de crédito, Débito de cuenta, Débito de tarjeta) and only for payments tied to a student. Flow: `paymentsController.emitirFactura` → `afipService.js` (WSAA/WSFE) → CAE stored on the `payment` row (`cae`, `caeVencimiento`, `invoiceNumber`, `invoiceType`); PDF generated by `utils/pdfUtils.js` per RG 4291 with QR; email sent via `templates/invoice_email.html`. `docs/feature-afip-alta-movimiento.md` documents a not-yet-implemented plan to trigger emission inline from the "informar ingreso" form instead of post-creation from the payments table — check current state of `paymentsSection.jsx` before assuming it's done.

### Excel exports
All exports follow the same pattern: service builds a buffer (ExcelJS) → controller sets download headers → frontend fetches as a blob → creates a temporary object URL → triggers download. See `courseService.js` (`exportStudentsByCourse`, `exportProfessorsPayments`).

### Key model relationships
```
student ──< courseStudent >── course          (courseStudent.inscriptionDate)
student ──< courseStudentSuspend >── course   (suspendedAt / suspendedEndAt)
student ──< payment >── course ── professor
course ──< professorCourse >── professor      (periods JSON, criteria, criteriaValue)
payment ── item ── category
payment ── file (comprobante) / mercadoPagoPayment / secretaryPayment
course ──< courseTask >──< studentCourseTask >── student
headquarter                                    (multi-location, loosely referenced)
```

## Environment / deploy notes
- `docker-compose.yml` builds frontend, backend (`maas-yoga-admin-panel-api`), and a `postgres` `db` service; `docker-compose-only-backend.yml` runs just backend+db.
- Backend and frontend each read their own `.env` (see `.env.example` at repo root, `backend/.env.example`, `frontend/.env.example`).
- Google Drive storage integration is optional/toggleable via env (`GOOGLE_DRIVE_ENABLED` and related `GOOGLE_*` vars).
- SSL certs for AFIP live under `backend/certificates`/`backend/certs`; see `backend/scripts/AFIP_CERTIFICADOS.md` and `backend/scripts/generate-cert-request.js` for generating/renewing them.

## Codegraph
There is a codegraph generated for the frontend and backend at /backend/.codegraph and /frontend/.codegraph.

Codegraph GitHub: https://github.com/colbymchenry/codegraph