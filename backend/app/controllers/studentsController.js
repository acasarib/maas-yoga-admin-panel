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

  /**
   * /students/{studentId}/courses/{courseId}/suspend?from={from}&to={to} [PUT]
   * @param studentId
   * @param courseId
   * @param from from when the student suspension begins
   * @param to until when the student suspension ends (can be null if suspension not ends yet)
   * Format of from/to must be in format yyyy-mm
   * @returns HttpStatus ok no content if suspension was edited
   */
  suspendStudentFromCourse: async (req, res, next) => {
    try {
      const { from, to } = req.query;
      const { courseId, studentId } = req.params;
      await studentService.suspendStudentFromCourse(studentId, courseId, from, to);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /students/{studentId}/courses/{courseId}/suspend?from={from}&to={to} [DELETE]
   * @param studentId
   * @param courseId
   * @param from from when the student suspension begins
   * @param to until when the student suspension ends (can be null if suspension not ends yet)
   * Format of from/to must be in format yyyy-mm
   * @returns HttpStatus ok no content if suspension was deleted
   */
  deleteSuspendStudentFromCourse: async (req, res, next) => {
    try {
      const { from, to } = req.query;
      const { courseId, studentId } = req.params;
      await studentService.deleteSuspendStudentFromCourse(studentId, courseId, from, to);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },
};