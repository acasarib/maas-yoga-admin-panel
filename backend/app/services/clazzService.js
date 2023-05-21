import { clazz, payment, clazzDayDetail } from "../db/index.js";
import { DAYS } from "../utils/constants.js";

const createDays = async (clazzId, clazzDays) => {
  const validDays = Object.keys(clazzDays).filter(key => DAYS.includes(key.toLocaleLowerCase()));
  const dayDetails = validDays.map(dayName => ({ 
    id: clazzId,
    day: dayName,
    startAt: clazzDays[dayName].startAt,
    endAt: clazzDays[dayName].endAt,
  }));
  return await clazzDayDetail.bulkCreate(dayDetails);
}

export const create = async (clazzParam) => {
  const createdClazz = await clazz.create(clazzParam);
  await createDays(createdClazz.id, clazzParam.days);
  return getById(createdClazz.id);
};

export const deleteById = async (id) => {
  clazz.destroy({ where: { id } });
};

export const editById = async (clazzParam, id) => {
  if (clazzParam.paymentsVerified)
    payment.update({ verified: true }, { where: { clazzId: id } });
  await clazz.update(clazzParam, { where: { id } });
  if ("days" in clazzParam) {
    await clazzDayDetail.destroy({ where: { id }});
    await createDays(id, clazzParam.days);
  }
  return getById(id);
};

export const getById = async (id) => {
  const c = await clazz.findByPk(id, { include: [clazzDayDetail] });
  calcDays(c);
  return c;
};

export const getAll = async (specification) => {
  const clazzes = await clazz.findAll({
    where: specification.getSequelizeSpecification(),
    include: [clazzDayDetail],
  });
  clazzes.forEach(c => calcDays(c));
  return clazzes;
};

const calcDays = (c) => {
  c.dataValues.days = {};
  c.clazzDayDetails.forEach(d => {
    c.dataValues.days[d.day] = { startAt: d.startAt, endAt: d.endAt };
  });
  delete c.dataValues.clazzDayDetails;
}