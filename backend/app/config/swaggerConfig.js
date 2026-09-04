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
        description: process.env.NODE_ENV === "production" ? "Production Server" : "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtenido desde el endpoint /api/v1/users/login",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Users",
        description: "Endpoints para autenticación y gestión de usuarios",
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
        name: "Payments",
        description: "Endpoints para gestión de pagos",
      },
      {
        name: "Professors",
        description: "Endpoints para gestión de profesores",
      },
      {
        name: "Categories",
        description: "Endpoints para gestión de categorías",
      },
      {
        name: "Headquarters",
        description: "Endpoints para gestión de sedes",
      },
      {
        name: "Classes",
        description: "Endpoints para gestión de clases",
      },
      {
        name: "Tasks",
        description: "Endpoints para gestión de tareas de cursos",
      },
      {
        name: "Templates",
        description: "Endpoints para gestión de plantillas de email",
      },
      {
        name: "Files",
        description: "Endpoints para gestión de archivos",
      },
      {
        name: "Logs",
        description: "Endpoints para consulta de logs",
      },
      {
        name: "Notifications",
        description: "Endpoints para gestión de notificaciones",
      },
    ],
  },
  apis: [
    "./app/docs/schemas/*.js",
    "./app/routes/*.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
