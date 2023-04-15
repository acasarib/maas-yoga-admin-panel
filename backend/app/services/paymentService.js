import { payment, course, student, user, item } from "../db/index.js";
import { PAYMENT_TYPES } from "../utils/constants.js";

const isPaymentVerified = payment => {
  const value = parseFloat(payment.value);
  const clazzId = payment.clazzId === undefined ? null : payment.clazzId;
  return value < 0 || payment.type !== PAYMENT_TYPES.CASH || clazzId === null;
};

export const create = async (paymentParam) => {
  paymentParam.verified = isPaymentVerified(paymentParam);
  return payment.create(paymentParam);
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
