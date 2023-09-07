import { logPayment } from "../db/index.js";
import { LOG_PAYMENT_ACTIONS } from "../utils/constants.js";

export const getAll = async (from = null, to = null) => {
  return logPayment.findAll();
};

export const logCreatedPayments = async (payments) => {
  const logs = payments.map(p => ({ paymentId: p.id, userId: p.userId, action: LOG_PAYMENT_ACTIONS.CREATE }));
  logPayment.bulkCreate(logs);
};

export const logUpdate = async (paymentId, userId) => {
  logPayment.create({
    paymentId,
    userId,
    action: LOG_PAYMENT_ACTIONS.UPDATE,
  });
};

export const logVerified = async (paymentId, userId) => {
  logPayment.create({
    paymentId,
    userId,
    action: LOG_PAYMENT_ACTIONS.VERIFICATION,
  });
};

export const deletePayment = async (userId) => {
  logPayment.create({ userId, action: LOG_PAYMENT_ACTIONS.DELETE });
};