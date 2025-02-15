import { Op } from "sequelize";
import { notificationPayment, user, payment } from "../db/index.js";

export const getAllNotificationPayments = async (userId) => {
  return notificationPayment.findAll({ where: { userId, paymentId: {[Op.ne]: null} }, include: [{model: payment, include: user}]});
};

export const newNotificationPayment = async (paymentId, userId) => {
  return notificationPayment.create({ paymentId, userId });
};

export const notifyAll = async (paymentId) => {
  const users = await user.findAll()
  const notificationPayments = users.map(u => ({ userId: u.id, paymentId }))
  notificationPayment.bulkCreate(notificationPayments);
};

export const deleteById = async (id) => {
  const np = await notificationPayment.findByPk(id);
  return np.destroy()
};

export const deleteByIdAllUsers = async (paymentId) => {
  return notificationPayment.destroy({ where: { paymentId } });
};


export const notifyToUser = async (userId, paymentId) => {
  return notificationPayment.create({ userId, paymentId });
};