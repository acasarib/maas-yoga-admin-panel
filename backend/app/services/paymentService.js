import { payment, course, student, user, file } from "../db/index.js";
import { PAYMENT_TYPES } from "../utils/constants.js";

const isPaymentVerified = payment => {
  const value = parseFloat(payment.value);
  const clazzId = payment.clazzId === undefined ? null : payment.clazzId;
  return value < 0 || payment.type !== PAYMENT_TYPES.CASH || clazzId === null;
};

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
    if (p.verified === null || p === undefined)
      p.verified = isPaymentVerified(p);
    p.userId = informerId;
  });
  const createdPayments = await payment.bulkCreate(paymentParam);
  return (createdPayments.length === 1) ? createdPayments[0] : createdPayments;
};

export const deleteById = async (id) => {
  const p = await payment.findByPk(id);
  if (p.fileId) {
    file.destroy({ where: { id: p.fileId } });
  }
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
    include: specification.getSequelizeSpecificationAssociations([user, student, course])
  });
};
