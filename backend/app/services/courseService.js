import { course, student, courseTask, studentCourseTask } from "../db/index.js";

export const create = async (courseParam) => {
  return course.create(courseParam);
};

export const deleteById = async (id) => {
  course.destroy({ where: { id } });
};

export const editById = async (courseParam, id) => {
  return course.update(courseParam, { where: { id } });
};

export const getById = async (id) => {
  return course.findByPk(id, { include: [student, courseTask] });
};

export const getAll = async () => {
  return course.findAll({ include: [
    student,
    { model: courseTask, include:[student] },
  ]});
};

export const setStudentsToCourse = async (students, courseId) => {
  const courseDb = await course.findByPk(courseId);
  const studentsDb = await student.findAll({ where: { id: students } });
  await courseDb.setStudents(studentsDb, { through: "course_student" });
  return course.findByPk(courseId, { include: [student] });
};

export const addCourseTask = async (courseTaskParam, courseId) => {
  courseTaskParam.courseId = courseId;
  return courseTask.create(courseTaskParam);
};

export const getTasksByCourseId = async (courseId, specification) => {
  return courseTask.findAll({
    where: {
      ...specification.getSequelizeSpecification(),
      courseId
    },
    include: [student],
  });
};

export const editCourseTask = async (courseTaskParam, id) => {
  return courseTask.update(courseTaskParam, { where: { id } });
};

export const deleteCourseTask = async (id) => {
  courseTask.destroy({ where: { id } });
};

export const setStudentsToTask = async (students, courseTaskId) => {
  const courseTaskDb = await courseTask.findByPk(courseTaskId);
  await courseTaskDb.setStudents(students, { through: studentCourseTask });
};

export const getStudentsByCourseTask = async (courseTaskId) => {
  return studentCourseTask.findAll({
    where: { courseTaskId }
  })
};

export const setCompletedStudentTask = async (studentCourseTaskParam, courseTaskId, studentId) => {
  studentCourseTask.update(studentCourseTaskParam, { where: { courseTaskId, studentId } })
};