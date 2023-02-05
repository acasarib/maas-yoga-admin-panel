import * as paymentService from "../services/paymentService.js";
import { StatusCodes } from "http-status-codes";

export default {
  /**
   * /payments/students/{studentId} [POST]
   * @returns HttpStatus created and @Payment
   */
  create: async (req, res, next) => {
    try {
      req.body.studentId = req.params.studentId;
      req.body.userId = req.user.id;
      const createdPayment = await paymentService.create(req.body);
      res.status(StatusCodes.CREATED).json(createdPayment);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/students/{studentId} [GET]
   * @returns HttpStatus ok and array of @Payment
   */
  getAllByStudentId: async (req, res, next) => {
    try {
      const payments = await paymentService.getAllByStudentId(req.params.studentId);
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/courses/{courseId} [GET]
   * @returns HttpStatus ok and array of @Payment
   */
  getAllByCourseId: async (req, res, next) => {
    try {
      const payments = await paymentService.getAllByCourseId(req.params.courseId);
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments [GET]
   * @returns HttpStatus ok and array of @Payment
   */
  getAll: async (req, res, next) => {
    try {
      const payments = await paymentService.getAll();
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

};