import * as paymentService from "../services/paymentService.js";
import { StatusCodes } from "http-status-codes";
import Specification from "../models/Specification.js";
import { payment } from "../db/index.js";

export default {
  /**
   * /payments [POST]
   * @returns HttpStatus created and @Payment
   */
  create: async (req, res, next) => {
    try {
      const createdPayment = await paymentService.create(req.body, req.user.id);
      res.status(StatusCodes.CREATED).json(createdPayment);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await paymentService.deleteById(req.params.id, req.user.id);
      res.status(StatusCodes.NO_CONTENT).send();
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
      const querySpecification = req.query.q;
      const isOrOperation = req.query.isOrOperation === 'true'
      const specification = new Specification(querySpecification, payment, isOrOperation);
      const payments = await paymentService.getAll(specification);
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/{id} [PUT]
   * @returns HttpStatus ok and @Payment updated
   */
  updatePayment: async (req, res, next) => {
    try {
      const updatedPayment = await paymentService.updatePayment(req.params.id, req.body, req.user.id);
      res.status(StatusCodes.OK).json(updatedPayment);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/{id}/verified [PUT]
   * @returns HttpStatus ok
   */
  changeVerified: async (req, res, next) => {
    try {
      await paymentService.changeVerified(req.params.id, req.body.verified, req.user.id);
      res.status(StatusCodes.OK).json();
    } catch (e) {
      next(e);
    }
  },

};