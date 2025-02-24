import { logPayment, user } from "../db/index.js";
import { Op } from "sequelize";
import { LOG_PAYMENT_ACTIONS } from "../utils/constants.js";
import utils from "../utils/functions.js";

/**
 * 
 * @param {int} page
 * @param {int} size 
 * @param {Object} where with userFullName (firstName + lastName), date (dd/mm/yyyy)
 * @returns Pageable payments
 */
export const getAll = async (page = 1, size = 10, where) => {
  let { userFullName, date, search } = where;
  if (search) {
    userFullName = search;
    date = search;
  }
  const findAllParams = {
    include: [{model: user}],
    limit: size,
    offset: (page - 1) * size,
    where: {},
  };

  // Filtro por date
  date = utils.fromDDMMYYYYStringToDate(date);
  if (date !== null) {
    const startDate = new Date(date.getTime()).setHours(0, 0, 0, 0);
    const endDate = new Date(date.getTime()).setHours(23, 59, 59, 999);
    
    findAllParams.where.createdAt = {
      [Op.gte]: startDate,
      [Op.lte]: endDate
    };
  }

  if (userFullName && findAllParams.where.createdAt === undefined) {
    findAllParams.include[0].where = {
      [Op.or]: [
        {
          firstName: {
            [Op.iLike]: `%${userFullName}%`
          }
        },
        {
          lastName: {
            [Op.iLike]: `%${userFullName}%`
          }
        }
      ]
    };
  }

  let { count, rows } = await logPayment.findAndCountAll(findAllParams);
  return {
    totalItems: count,
    totalPages: Math.ceil(count / size),
    currentPage: page,
    data: rows,
  };
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