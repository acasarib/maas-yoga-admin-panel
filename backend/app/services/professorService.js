import { course, professor, payment, professorCourse } from "../db/index.js";

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
  const p = await professor.findByPk(id, { include: [course, payment] });
  for (const course of p.courses) {
    course.dataValues.professorCourse = await professorCourse.findAll({ where: { courseId: course.id, professorId: p.id } });
  }
  return p;
};

export const getAll = async (specification) => {
  return await professor.findAll({
    where: specification.getSequelizeSpecification(),
    /*include: [clazzDayDetail],*/
  });
};
