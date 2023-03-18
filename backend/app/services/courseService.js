import { course, student } from "../db/index.js";

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
  return course.findByPk(id, { include: [student] });
};

export const getAll = async () => {
  return course.findAll({ include: [student] });
};

export const setStudentsToCourse = async (students, courseId) => {
  const courseDb = await course.findByPk(courseId);
  const studentsDb = await student.findAll({ where: { id: students } });
  await courseDb.setStudents(studentsDb, { through: "course_student" });
  return course.findByPk(courseId, { include: [student] });
};
