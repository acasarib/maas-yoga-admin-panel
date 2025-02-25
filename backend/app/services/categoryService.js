import { category, item } from "../db/index.js";

export const create = async (categoryParam) => {
  const createdCategory = await category.create(categoryParam);
  if ("items" in categoryParam && categoryParam.items.length > 0)
    await Promise.all(categoryParam.items.map(i => item.create({ ...i, categoryId: createdCategory.id })));
  return getById(createdCategory.id);
};

export const deleteById = async (id) => {
  const c = await category.findByPk(id, { include: [item] });
  c.destroy();
};

export const editById = async (categoryParam, id) => {
  const c = await category.findByPk(id);
  await category.update(categoryParam, { where: { id } });
  if ("items" in categoryParam && categoryParam.items.length > 0) {
    const items = await Promise.all(categoryParam.items.map(i => {
      const isNewItem = !("id" in i);
      if (isNewItem)
        return item.create({ ...i, categoryId: id });
      else
        item.update({ ...i, categoryId: id }, { where: { id: i.id } });
      return item.findByPk(i.id);
    }));
    await c.setItems(items.map(i => i.id));
    await item.destroy({ where: { categoryId: null } });
  }
  return getById(id);
};

export const getById = async (id) => {
  return category.findByPk(id, { include: [item] });
};

export const getAll = async () => {
  return category.findAll({ include: [item] });
};

export const getAllItems = async () => {
  return item.findAll({
    attributes: ["title", "id"],
    include: {
      model: category,
      attributes: ["title"]
    }
  });
};