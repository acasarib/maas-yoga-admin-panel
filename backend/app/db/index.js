import { config } from "../config/db.config.js";
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sslConfig = config.sslConnection ? {
  dialectOptions: {
    ssl: {
      require: true
    }
  }
} : {};

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  ...sslConfig,
  operatorsAliases: "0",
  //logging: false,
  define: {
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
const modelsFileNames = await fs.promises.readdir(path.join(__dirname, "/models"));
const onlyJsFileNames = modelsFileNames.filter((file) => file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js");
for (const modelName of onlyJsFileNames) {
  const filePath = "file://" + path.join(__dirname, "/models", modelName);
  const model = await import(filePath);
  modelDefiners.push(model.default);
}

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));

//Relaciones

const { user, course, student } = sequelize.models;


student.belongsToMany(course, { through: "course_student" });
course.belongsToMany(student, { through: "course_student" });

export {
  sequelize,
  user,
  course,
  student,
};