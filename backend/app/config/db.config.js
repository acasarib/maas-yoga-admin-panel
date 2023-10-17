export const config = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || "5432",
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  sslConnection: (process.env.BACKEND_SSL_DB_CONNECTION === undefined || process.env.BACKEND_SSL_DB_CONNECTION === "false") ? false : true,
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};