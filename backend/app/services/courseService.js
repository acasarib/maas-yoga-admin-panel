import { course } from "../db/index.js";

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
  return course.findByPk(id);
};

export const getAll = async () => {
  return course.findAll();
};
