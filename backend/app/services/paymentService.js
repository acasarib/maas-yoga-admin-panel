import { StatusCodes } from "http-status-codes";
import { payment, course, student, user, file, professor, secretaryPayment, servicePayment, item, headquarter, clazz } from "../db/index.js";
import * as logService from "./logService.js";
import * as notificationService from "./notificationService.js";
import { Op } from "sequelize";
import utils from "../utils/functions.js";

const defaultPaymentInclude = [{ model: professor, attributes: ["name", "lastName"]},user, student, course, file, secretaryPayment, headquarter, item, clazz, student];
/**
 * 
 * @param {Array||Payment} paymentParam 
 * @returns {Array} created payments if @param paymentParam is Array
 * @returns {Student} created payments if @param paymentParam is Payment
 */
export const create = async (paymentParam, informerId) => {
  const isArray = Array.isArray(paymentParam);
  if (!isArray && paymentParam.isRegistrationPayment) {
    const { courseId, studentId } = paymentParam;
    if (!utils.isNumber(courseId))
      throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "invalid courseId" });
    if (!utils.isNumber(studentId))
      throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "invalid studentId" });
    const registrationPayment = await payment.findOne({ where: { isRegistrationPayment: true, studentId, courseId } })
    const alreadyRegistered = registrationPayment != null;
    if (alreadyRegistered) {
      throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "registration already added, paymentId=" + registrationPayment.id });
    }
  }
  paymentParam = isArray ? paymentParam : [paymentParam];
  for (const p of paymentParam) {
    if (p.secretaryPayment != null) {
      const { salary, sac, extraHours, extraTasks, monotributo, ...rest } = p.secretaryPayment
      let currentSecretaryPayment = await secretaryPayment.findOne({ where: { salary, sac, extraHours, extraTasks, monotributo } })
      delete p.secretaryPayment
      if (currentSecretaryPayment == undefined || currentSecretaryPayment == null) {
        currentSecretaryPayment = await secretaryPayment.create({ salary, sac, extraHours, extraTasks, monotributo })
      }
      p.secretaryPaymentId = currentSecretaryPayment.id
    }
    if ("id" in p) {
      p.oldId = p.id;
      delete p.id;
    }
    if (!("verified" in p))
      p.verified = true;
    p.userId = informerId;
  };
  const createdPayments = await payment.bulkCreate(paymentParam);
  logService.logCreatedPayments(createdPayments);
  return (createdPayments.length === 1) ? getById(createdPayments[0].id) : createdPayments;
};

export const splitPayment = async (originalPaymentId, newPaymentParam) => {
  let originalPayment = await payment.findByPk(originalPaymentId);
  const paymentCloned = originalPayment.get({ plain: true });
  for (const key of Object.keys(newPaymentParam)) {
    paymentCloned[key] = newPaymentParam[key]
  }
  delete paymentCloned.id
  paymentCloned.paymentId = originalPaymentId
  const paymentCreated = await payment.create(paymentCloned)
  originalPayment = await payment.findByPk(originalPaymentId);
  originalPayment.value -= newPaymentParam.value;
  originalPayment.save()
  return paymentCreated;
}

export const createSecretaryPayment = (secretaryPaymentParam) => {
  return secretaryPayment.create(secretaryPaymentParam);
}

export const createServicePayment = (servicePaymentParam) => {
  return servicePayment.create(servicePaymentParam);
}

export const getServicePayments = async () => {
  return servicePayment.findAll({ include: [item] });
};

export const updatedServicePayment = async (id, data) => {
  await servicePayment.update(data, { where: { id } });
  return servicePayment.findOne({ where: { id }, include: [item]})
};

export const deleteServicePayment = async (id) => {
  await servicePayment.destroy({ where: { id } });
}

export const addTodayPaymentServices = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  console.log("CRON addTodayPaymentServices adding services with date " + formattedDate, { dayOfMonth: today.getDate(), lastTimeAdded: { [Op.not]: formattedDate } });
  const todayServicePayments = await servicePayment.findAll({
    where: {
      [Op.and]: [
        { dayOfMonth: today.getDate() },
        { [Op.or]: [
          { lastTimeAdded: { [Op.not]: formattedDate } },
          { lastTimeAdded: null }
        ]}
      ]
    }
  });
  let newPayments = []
  todayServicePayments.forEach(sp => {
    let { type, value, discount, note, itemId } = sp
    if (value > 0)
      value = value *-1
    newPayments.push({ type, value, discount, note, itemId, at: today, operativeResult: today, })
  })
  console.log("Adding " + newPayments.length + " payments");
  for (const newPayment of newPayments) {
    const dbPayment = await payment.create(newPayment);
    notificationService.notifyAll(dbPayment.id);
  }
  todayServicePayments.forEach(sp => {
    sp.lastTimeAdded = formattedDate
    sp.save()
  })
}

export const getSecretaryPayments = async () => {
  return secretaryPayment.findAll();
};

export const getLatestSecretaryPayment = async () => {
  const latestPayment = await secretaryPayment.findOne({
    order: [["createdAt", "DESC"]]
  });
  return latestPayment;
};


export const deleteById = async (id, userId) => {
  const p = await payment.findByPk(id);
  if (p) {
    if (p.fileId) {
      file.destroy({ where: { id: p.fileId } });
    }
    logService.deletePayment(userId);
    return p.destroy();
  } else {
    throw ({ statusCode: 404, message: "Payment not found"})
  }
};

export const getAllByStudentId = async (studentId) => {
  return payment.findAll({ where: { studentId }, include: [user, student, course] });
};

export const getAllByCourseId = async (courseId) => {
  return payment.findAll({ where: { courseId }, include: [user, student, course] });
};

/**
 * @deprecated
 * @param {Object} specification 
 * @returns 
 */
export const legacyGetAll = async (specification) => {
  return payment.findAll({
    where: specification.getSequelizeSpecification(),
    include: specification.getSequelizeSpecificationAssociations([{ model: professor, attributes: ["name", "lastName"]},user, student, course, file, {
      model: user,
      as: "verifiedByUser",
      attributes: ["firstName", "lastName"]
    }])
  });
};

export const getAll = async (page = 1, size = 10, specification) => {
  const where = specification.getSequelizeSpecification();
  const include = specification.getSequelizeSpecificationAssociations(defaultPaymentInclude);
  const findAllParams = {
    include,
    limit: size,
    offset: (page - 1) * size,
    where,
    order: [
      ["at", "DESC"]
    ]
  };
  let { count, rows } = await payment.findAndCountAll(findAllParams);
  const total = await payment.sum("value", { where });
  const incomes = await payment.sum("value", { 
    where: { ...where, value: { [Op.gte]: 0 } }
  });
  const expenses = await payment.sum("value", { 
    where: { ...where, value: { [Op.lt]: 0 } }
  });
  return {
    totalItems: count,
    totalPages: Math.ceil(count / size),
    currentPage: page,
    data: rows,
    total,
    incomes,
    expenses: expenses *-1,
  };
};

/**
 * TODO
 * @param {int} page 
 * @param {int} size 
 * @param {Object} specification 
 * @returns 
 */
export const getAllUnverified = async (page = 1, size = 10, specification) => {
  const spec = specification.getSequelizeSpecification();
  const where = {
    [Op.and]: [{verified: false}, spec]
  };
  
  const include = specification.getSequelizeSpecificationAssociations(defaultPaymentInclude);
  const findAllParams = {
    include,
    limit: size,
    offset: (page - 1) * size,
    where,
    order: [
      ["at", "DESC"]
    ]
  };
  let { count, rows } = await payment.findAndCountAll(findAllParams);
  const total = await payment.sum("value", { where });
  const incomes = await payment.sum("value", { 
    where: { ...where, value: { [Op.gte]: 0 } }
  });
  const expenses = await payment.sum("value", { 
    where: { ...where, value: { [Op.lt]: 0 } }
  });
  return {
    totalItems: count,
    totalPages: Math.ceil(count / size),
    currentPage: page,
    data: rows,
    total,
    incomes,
    expenses: expenses *-1,
  };
};

export const getAllVerified = async (page = 1, size = 10, specification) => {
  const spec = specification.getSequelizeSpecification();
  const where = {
    [Op.and]: [{verified: true}, spec]
  };
  
  const include = specification.getSequelizeSpecificationAssociations(defaultPaymentInclude);
  const findAllParams = {
    include,
    limit: size,
    offset: (page - 1) * size,
    where,
    order: [
      ["at", "DESC"]
    ]
  };
  let { count, rows } = await payment.findAndCountAll(findAllParams);
  const total = await payment.sum("value", { where });
  const incomes = await payment.sum("value", { 
    where: { ...where, value: { [Op.gte]: 0 } }
  });
  const expenses = await payment.sum("value", { 
    where: { ...where, value: { [Op.lt]: 0 } }
  });
  return {
    totalItems: count,
    totalPages: Math.ceil(count / size),
    currentPage: page,
    data: rows,
    total,
    incomes,
    expenses: expenses *-1,
  };
};

export const updatePayment = async (id, data, userId) => {
  if (data.verified)
    throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "Can not change verified with this endpoint" });
  await payment.update(data, { where: { id } });
  logService.logUpdate(id, userId);
  return getById(id);
};

export const getById = async (id) => {
  const p = await payment.findByPk(id, { include: defaultPaymentInclude });
  if (p == null)
    throw ({ statusCode: StatusCodes.NOT_FOUND, message: "payment not found" });
  return p;
};

export const changeVerified = async (id, verified, verifiedBy) => {
  const newData = { verified };
  if (verified)
    newData.verifiedBy = verifiedBy;
  if (verified)
    logService.logVerified(id, verifiedBy);
  else
    logService.logUpdate(id, verifiedBy);
  return payment.update(newData, { where: { id } });
};