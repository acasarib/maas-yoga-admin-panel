import { student, course, courseTask } from "../db/index.js";

export const create = async (studentParam) => {
  return student.create(studentParam);
};

export const deleteById = async (id) => {
  return student.destroy({ where: { id } });
};

export const editById = async (studentParam, id) => {
  return student.update(studentParam, { where: { id } });
};

export const getById = async (id) => {
  return student.findByPk(id, { include: [course, courseTask] });
};

export const getAll = async () => {
  return student.findAll({ include: [course] });
};
