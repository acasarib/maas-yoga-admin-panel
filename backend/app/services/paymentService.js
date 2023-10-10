import { StatusCodes } from "http-status-codes";
import { payment, course, student, user, file, professor } from "../db/index.js";
import { PAYMENT_TYPES } from "../utils/constants.js";
import * as logService from "./logService.js";

/**
 * 
 * @param {Array||Payment} paymentParam 
 * @returns {Array} created payments if @param paymentParam is Array
 * @returns {Student} created payments if @param paymentParam is Payment
 */
export const create = async (paymentParam, informerId) => {
  const isArray = Array.isArray(paymentParam);
  paymentParam = isArray ? paymentParam : [paymentParam];
  paymentParam.forEach(p => {
    if ("id" in p) {
      p.oldId = p.id;
      delete p.id;
    }
    if (!("verified" in p))
      p.verified = true;
    p.userId = informerId;
  });
  const createdPayments = await payment.bulkCreate(paymentParam);
  logService.logCreatedPayments(createdPayments);
  return (createdPayments.length === 1) ? createdPayments[0] : createdPayments;
};

export const deleteById = async (id, userId) => {
  const p = await payment.findByPk(id);
  if (p.fileId) {
    file.destroy({ where: { id: p.fileId } });
  }
  logService.deletePayment(userId);
  return p.destroy();
};

export const getAllByStudentId = async (studentId) => {
  return payment.findAll({ where: { studentId }, include: [user, student, course] });
};

export const getAllByCourseId = async (courseId) => {
  return payment.findAll({ where: { courseId }, include: [user, student, course] });
};

export const getAll = async (specification) => {
  return payment.findAll({
    where: specification.getSequelizeSpecification(),
    include: specification.getSequelizeSpecificationAssociations([{ model: professor, attributes: ["name", "lastName"]},user, student, course, file])
  });
};

export const updateUnverifiedPayment = async (id, data, userId) => {
  if (data.verified)
    throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "Can not change verified with this endpoint" });
  await payment.update(data, { where: { id } });
  logService.logUpdate(id, userId);
  return payment.findByPk(id, { include: [user,student,course] });
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