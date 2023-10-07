import { student, course, courseTask, payment } from "../db/index.js";

/**
 * 
 * @param {Array||Student} studentParam 
 * @returns {Array} created students if @param studentParam is Array
 * @returns {Student} created student if @param studentParam is Student
 */
export const create = async (studentParam) => {
  const isArray = Array.isArray(studentParam);
  const createdStudents = await student.bulkCreate(isArray ? studentParam : [studentParam]);
  return (createdStudents.length === 1) ? createdStudents[0] : createdStudents;
};

export const deleteById = async (id) => {
  return student.destroy({ where: { id } });
};

export const editById = async (studentParam, id) => {
  return student.update(studentParam, { where: { id } });
};

export const getById = async (id) => {
  return student.findByPk(id, { include: [course, courseTask, payment] });
};

export const getAll = async () => {
  return student.findAll({ include: [course] });
};
