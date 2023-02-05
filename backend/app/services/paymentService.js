import { payment, course, student, user } from "../db/index.js";

export const create = async (paymentParam) => {
  return payment.create(paymentParam);
};

export const getAllByStudentId = async (studentId) => {
  return payment.findAll({ where: { studentId }, include: [user, student, course] });
};

export const getAllByCourseId = async (courseId) => {
  return payment.findAll({ where: { courseId }, include: [user, student, course] });
};

export const getAll = async () => {
  return payment.findAll({ include: [user, student, course] });
};
