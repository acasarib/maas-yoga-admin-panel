import { template } from "../db/index.js";

export const create = async (templateParam) => {
  templateParam.content = JSON.stringify(templateParam.content);
  const createdTemplate = await template.create(templateParam);
  createdTemplate.content = JSON.parse(createdTemplate.content);
  return createdTemplate;
};

export const deleteById = async (id) => {
  template.destroy({ where: { id } });
};

export const editById = async (templateParam, id) => {
  templateParam.content = JSON.stringify(templateParam.content);
  await template.update(templateParam, { where: { id } });
  return getById(id);
};

export const getById = async (id) => {
  const templateDb = await template.scope("withContent").findByPk(id);
  templateDb.content = JSON.parse(templateDb.content);
  return templateDb;
};

export const getAll = async () => {
  return template.findAll();
};
