import { config } from "../config/db.config.js";
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sslConfig = config.sslConnection ? {
  dialectOptions: {
    encrypt: true,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  ssl: true,
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

const { user, course, student, payment, file, task, headquarter, courseTask, studentCourseTask, template, clazz, item, category, clazzDayDetail } = sequelize.models;


course.belongsToMany(headquarter, { through: "headquarter_course" });
headquarter.belongsToMany(course, { through: "headquarter_course" });
student.belongsToMany(course, { through: "course_student" });
course.belongsToMany(student, { through: "course_student" });
file.hasOne(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
item.hasOne(payment,  { foreignKey: { allowNull: true }, targetKey: "id" });
student.hasMany(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
course.hasMany(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
clazz.hasMany(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
headquarter.hasMany(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
user.hasOne(payment, { foreignKey: { allowNull: false }, targetKey: "id" });
payment.belongsTo(user);
payment.belongsTo(student, { foreignKey: { allowNull: true } });
payment.belongsTo(clazz, { foreignKey: { allowNull: true } });
payment.belongsTo(course, { foreignKey: { allowNull: true } });
payment.belongsTo(item, { foreignKey: { allowNull: true } });
payment.belongsTo(headquarter, { foreignKey: { allowNull: true } });
courseTask.belongsTo(course);
course.hasMany(courseTask, { foreignKey: { allowNull: false }, targetKey: "id" });
student.belongsToMany(courseTask, { through: studentCourseTask });
courseTask.belongsToMany(student, { through: studentCourseTask });
category.hasMany(item, { onDelete: "CASCADE" });
item.belongsTo(category);
clazzDayDetail.belongsTo(clazz, { foreignKey: "id" });
clazz.hasMany(clazzDayDetail, { onDelete: "CASCADE", foreignKey: "id" });
clazz.belongsTo(headquarter);
headquarter.hasMany(clazz);

export {
  sequelize,
  user,
  course,
  student,
  payment,
  file,
  task,
  headquarter,
  courseTask,
  studentCourseTask,
  template,
  clazz,
  category,
  item,
  clazzDayDetail,
};