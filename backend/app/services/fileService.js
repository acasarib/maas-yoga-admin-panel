import { file } from "../db/index.js";

export const create = async (type, name, blob) => {
  return file.create({ type, name, blob });
};

export const getById = async (id) => {
  return file.findByPk(id);
};
