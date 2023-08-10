import { professor } from "../db/index.js";

export const create = async (professorParam) => {
  const createdProfessor = await professor.create(professorParam);
  return getById(createdProfessor.id);
};

export const deleteById = async (id) => {
  professor.destroy({ where: { id } });
};

export const editById = async (professorParam, id) => {
  await professor.update(professorParam, { where: { id } });
  return getById(id);
};

export const getById = async (id) => {
  return professor.findByPk(id/*, { include: [clazzDayDetail] }*/);
};

export const getAll = async (specification) => {
  return await professor.findAll({
    where: specification.getSequelizeSpecification(),
    /*include: [clazzDayDetail],*/
  });
};
