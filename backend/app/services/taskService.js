import { task } from "../db/index.js";

export const create = async (taskParam) => {
  return task.create(taskParam);
};

export const deleteById = async (id) => {
  task.destroy({ where: { id } });
};

export const editById = async (taskParam, id) => {
  return task.update(taskParam, { where: { id } });
};

export const getById = async (id) => {
  return task.findByPk(id);
};

export const getAll = async (specification) => {
  return task.findAll({
    where: specification.getSequelizeSpecification(),
    order: [
      ['createdAt', 'DESC']
    ]
  });
};
