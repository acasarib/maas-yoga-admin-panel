import * as notificationService from "../services/notificationService.js";
import { StatusCodes } from "http-status-codes";

export default {
  /**
   * /notifications/payments [GET]
   * @returns HttpStatus ok and array of @NotificationPayment
   */
  getAllNotificationPayments: async (req, res, next) => {
    try {
      const notificationPayments = await notificationService.getAllNotificationPayments(req.user.id);
      res.status(StatusCodes.OK).json(notificationPayments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /notifications/payments/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  notifyUser: async (req, res, next) => {
    try {
      const { userId } = req.body
      if (userId) {
        await notificationService.notifyToUser(userId, req.params.id);
      } else {
        await notificationService.notifyAll(req.params.id);
      }
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /notifications/payments/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await notificationService.deleteById(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /notifications/payments/{id}/all-users [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteByIdAllUsers: async (req, res, next) => {
    try {
      await notificationService.deleteByIdAllUsers(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

};