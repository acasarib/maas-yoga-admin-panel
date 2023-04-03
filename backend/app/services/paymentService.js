import { payment, course, student, user } from "../db/index.js";
import { PAYMENT_TYPES } from "../utils/constants.js";

export const create = async (paymentParam) => {
  if (paymentParam.type !== PAYMENT_TYPES.CASH)
    paymentParam.verified = true;
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
    include: [user, student, course]
  });
};
