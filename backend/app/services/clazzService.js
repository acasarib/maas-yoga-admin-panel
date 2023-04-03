import { clazz, payment } from "../db/index.js";

export const create = async (clazzParam) => {
  return clazz.create(clazzParam);
};

export const deleteById = async (id) => {
  clazz.destroy({ where: { id } });
};

export const editById = async (clazzParam, id) => {
  if (clazzParam.paymentsVerified)
    payment.update({ verified: true }, { where: { clazzId: id } });
  return clazz.update(clazzParam, { where: { id } });
};

export const getById = async (id) => {
  return clazz.findByPk(id);
};

export const getAll = async (specification) => {
  return clazz.findAll({
    where: specification.getSequelizeSpecification(),
  });
};
