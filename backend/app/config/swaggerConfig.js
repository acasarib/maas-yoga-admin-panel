import swaggerJsdoc from "swagger-jsdoc";
import { APP_VERSION } from "../utils/constants.js";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Maas Yoga Admin Panel API",
      version: APP_VERSION,
      description: "API REST para el panel administrativo de Maas Yoga. Gestiona estudiantes, cursos, profesores, pagos y facturación electrónica.",
      contact: {
        name: "Tomas Arras",
        email: "tomasarras@gmail.com",
      },
    },
    servers: [
      {
        url: "https://maas-yoga-admin-panel.onrender.com",
        description: "Testing Server",
      },
      {
        url: process.env.SWAGGER_SERVER_URL || "http://localhost:3000",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-Api-Key",
          description: "API Key para autenticación de integraciones externas",
        },
      },
    },
    security: [
      {
        apiKeyAuth: [],
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Endpoint de estado del servicio",
      },
      {
        name: "Students",
        description: "Endpoints para gestión de estudiantes",
      },
      {
        name: "Courses",
        description: "Endpoints para gestión de cursos",
      },
      {
        name: "Professors",
        description: "Endpoints para gestión de profesores",
      },
    ],
  },
  apis: [
    "./app/docs/schemas/common.js",
    "./app/docs/schemas/student.js",
    "./app/docs/schemas/course.js",
    "./app/docs/schemas/professor.js",
    "./app/routes/healthcheckRoute.js",
    "./app/routes/studentsRoute.js",
    "./app/routes/coursesRoute.js",
    "./app/routes/professorsRoute.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
