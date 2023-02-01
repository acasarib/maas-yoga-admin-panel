export const config = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  sslConnection: process.env.BACKEND_SSL_DB_CONNECTION === undefined ? true : Boolean(process.env.BACKEND_SSL_DB_CONNECTION),
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};