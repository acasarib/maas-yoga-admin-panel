import { headquarter, course } from "../db/index.js";

export const create = async (headquarterParam) => {
  return headquarter.create(headquarterParam);
};

export const deleteById = async (id) => {
  headquarter.destroy({ where: { id } });
};

export const editById = async (headquarterParam, id) => {
  return headquarter.update(headquarterParam, { where: { id } });
};

export const getById = async (id) => {
  return headquarter.findByPk(id);
};

export const getAll = async (specification) => {
  return headquarter.findAll({
    where: specification.getSequelizeSpecification()
  });
};

export const setCoursesToHeadquarter = async (courses, headquarterId) => {
  const headquarterDb = await headquarter.findByPk(headquarterId);
  const coursesDb = await course.findAll({ where: { id: courses } });
  await headquarterDb.setCourses(coursesDb, { through: "course_student" });
  return headquarter.findByPk(headquarterId, { include: [course] });
};