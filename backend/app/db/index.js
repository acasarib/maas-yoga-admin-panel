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
  logging: false,
  host: config.host,
  port: config.port,
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

const { notificationPayment, secretaryPayment, servicePayment, courseStudentSuspend, courseStudent, user, logPayment, course, student, payment, file, task, headquarter, courseTask, studentCourseTask, template, clazz, item, category, clazzDayDetail, professor, professorCourse, mercado_pago_payment } = sequelize.models;

notificationPayment.belongsTo(payment, { through: "payment_id" });
notificationPayment.belongsTo(user, { through: "user_id" });
payment.hasMany(logPayment);
payment.belongsTo(payment,{ foreignKey: { allowNull: true }, targetKey: "id" });
user.hasMany(logPayment);
logPayment.belongsTo(user, { foreignKey: "userId" });
professor.belongsToMany(course, { through: { model: professorCourse, unique: false} });
professorCourse.belongsTo(professor);
professor.hasMany(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
course.belongsToMany(professor, { through: { model: professorCourse, unique: false} });
course.belongsToMany(headquarter, { through: "headquarter_course" });
headquarter.belongsToMany(course, { through: "headquarter_course" });
student.belongsToMany(course, { through: courseStudent });
course.belongsToMany(student, { through: courseStudent });
course.hasMany(courseStudent);
courseStudent.belongsTo(course);
student.hasMany(courseStudent);
courseStudent.belongsTo(student);
courseStudentSuspend.belongsTo(course);
student.hasMany(courseStudentSuspend);
courseStudentSuspend.belongsTo(student);
secretaryPayment.hasMany(payment, { foreignKey: "secretaryPaymentId" });
payment.belongsTo(secretaryPayment, { foreignKey: "secretaryPaymentId" });
course.hasMany(courseStudentSuspend);
file.hasOne(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
item.hasOne(payment,  { foreignKey: { allowNull: true }, targetKey: "id" });
item.hasOne(servicePayment,  { foreignKey: { allowNull: true }, targetKey: "id" });
student.hasMany(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
course.hasMany(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
clazz.hasMany(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
headquarter.hasMany(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
user.hasOne(payment, { foreignKey: { allowNull: true }, targetKey: "id" });
payment.belongsTo(user, {
  foreignKey: { name: "verifiedBy", allowNull: true },
  as: "verifiedByUser"
});
payment.belongsTo(file, { foreignKey: { allowNull: true } });
user.hasOne(payment, { foreignKey: { allowNull: true }, targetKey: "verifiedBy" });
payment.belongsTo(user, { foreignKey: { allowNull: true } });
payment.belongsTo(student, { foreignKey: { allowNull: true } });
payment.belongsTo(professor, { foreignKey: { allowNull: true } });
payment.belongsTo(clazz, { foreignKey: { allowNull: true } });
payment.belongsTo(course, { foreignKey: { allowNull: true } });
payment.belongsTo(item, { foreignKey: { allowNull: true } });
servicePayment.belongsTo(item, { foreignKey: { allowNull: true } });
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

// Relaciones para MercadoPago Payment
mercado_pago_payment.belongsTo(student, { foreignKey: "studentId", as: "student" });
mercado_pago_payment.belongsTo(course, { foreignKey: "courseId", as: "course" });
mercado_pago_payment.belongsTo(payment, { foreignKey: "paymentId", as: "payment" });
student.hasMany(mercado_pago_payment, { foreignKey: "studentId" });
course.hasMany(mercado_pago_payment, { foreignKey: "courseId" });
payment.hasOne(mercado_pago_payment, { foreignKey: "paymentId" });

export {
  sequelize,
  professor,
  professorCourse,
  user,
  course,
  student,
  payment,
  file,
  task,
  headquarter,
  courseTask,
  studentCourseTask,
  courseStudentSuspend,
  template,
  clazz,
  category,
  item,
  clazzDayDetail,
  logPayment,
  courseStudent,
  servicePayment,
  secretaryPayment,
  notificationPayment,
  mercado_pago_payment,
};