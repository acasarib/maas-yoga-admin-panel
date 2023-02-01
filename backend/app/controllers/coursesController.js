import * as courseService from "../services/courseService.js";
import { StatusCodes } from "http-status-codes";

export default {
  /**
   * /courses [POST]
   * @returns HttpStatus created and @Course
   */
  create: async (req, res, next) => {
    try {
      const createdCourse = await courseService.create(req.body);
      res.status(StatusCodes.CREATED).json(createdCourse);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await courseService.deleteById(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/{id} [PUT]
   * @returns HttpStatus ok if was edited
   */
  editById: async (req, res, next) => {
    try {
      await courseService.editById(req.body, req.params.id);
      res.status(StatusCodes.OK).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/{id} [GET]
   * @returns HttpStatus ok and @Course
   */
  getById: async (req, res, next) => {
    try {
      const course = await courseService.getById(req.params.id);
      if (course)
        res.status(StatusCodes.OK).json(course);
      else
        res.status(StatusCodes.NOT_FOUND).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses [GET]
   * @returns HttpStatus ok and array of @Course
   */
  getAll: async (req, res, next) => {
    try {
      const courses = await courseService.getAll();
      res.status(StatusCodes.OK).json(courses);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/{id}/students [POST]
   * @returns HttpStatus ok and @Course
   */
  addStudentsToCourse: async (req, res, next) => {
    try {
      const course = await courseService.addStudentsToCourse(req.body, req.params.id);
      res.status(StatusCodes.OK).json(course);
    } catch (e) {
      next(e);
    }
  },

};