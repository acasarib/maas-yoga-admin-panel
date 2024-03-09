import * as studentService from "../services/studentService.js";
import { StatusCodes } from "http-status-codes";

export default {
  /**
   * /students [POST]
   * @returns HttpStatus created and @Student
   */
  create: async (req, res, next) => {
    try {
      const createdStudent = await studentService.create(req.body);
      res.status(StatusCodes.CREATED).json(createdStudent);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /students/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await studentService.deleteById(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /students/{id} [PUT]
   * @returns HttpStatus ok if was edited
   */
  editById: async (req, res, next) => {
    try {
      const editedStudent = await studentService.editById(req.body, req.params.id);
      res.status(StatusCodes.OK).json(editedStudent);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /students/{id} [GET]
   * @returns HttpStatus ok and @Student
   */
  getById: async (req, res, next) => {
    try {
      const student = await studentService.getById(req.params.id);
      if (student)
        res.status(StatusCodes.OK).json(student);
      else
        res.status(StatusCodes.NOT_FOUND).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /students/{id}/payments/pending [GET]
   * @returns HttpStatus ok and @Student
   */
  pendingPaymentsByStudentId: async (req, res, next) => {
    try {
      res.status(StatusCodes.OK).json(await studentService.pendingPaymentsByStudentId(req.params.id));
    } catch (e) {
      next(e);
    }
  },

  /**
   * /students/payments/pending [GET]
   * @returns HttpStatus ok and @Student
   */
  pendingPayments: async (req, res, next) => {
    try {
      res.status(StatusCodes.OK).json(await studentService.pendingPayments(req.params.id));
    } catch (e) {
      next(e);
    }
  },

  /**
   * /students [GET]
   * @returns HttpStatus ok and array of @Student
   */
  getAll: async (req, res, next) => {
    try {
      const students = await studentService.getAll();
      res.status(StatusCodes.OK).json(students);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /students/courses/{courseId} [GET]
   * @returns HttpStatus ok and array of @Student
   */
  getStudentsByCourse: async (req, res, next) => {
    try {
      const students = await studentService.getStudentsByCourse(req.params.courseId);
      res.status(StatusCodes.OK).json(students);
    } catch (e) {
      next(e);
    }
  },

};