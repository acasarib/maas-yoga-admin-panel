import * as courseService from "../services/courseService.js";
import { StatusCodes } from "http-status-codes";
import Specification from "../models/Specification.js";
import { courseTask } from "../db/index.js";

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
   * @returns HttpStatus ok and @Course edited
   */
  editById: async (req, res, next) => {
    try {
      const editedCourse = await courseService.editById(req.body, req.params.id);
      res.status(StatusCodes.OK).send(editedCourse);
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
   * /courses/{id}/students [PUT]
   * @returns HttpStatus ok and @Course
   */
  setStudentsToCourse: async (req, res, next) => {
    try {
      const course = await courseService.setStudentsToCourse(req.body, req.params.id);
      res.status(StatusCodes.OK).json(course);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/{id}/tasks [POST]
   * @returns HttpStatus ok and @CourseTask
   */
  addCourseTask: async (req, res, next) => {
    try {
      const courseTask = await courseService.addCourseTask(req.body, req.params.courseId);
      res.status(StatusCodes.OK).json(courseTask);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/{id}/tasks [GET]
   * @returns HttpStatus ok and @CourseTask
   */
  getCourseTasks: async (req, res, next) => {
    try {
      const querySpecification = req.query.q;
      const specification = new Specification(querySpecification, courseTask);
      const courseTasks = await courseService.getTasksByCourseId(req.params.courseId, specification);
      res.status(StatusCodes.OK).json(courseTasks);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/{courseId}/tasks/{id} [GET]
   * @returns HttpStatus ok and @CourseTask
   */
  getCourseTaskById: async (req, res, next) => {
    try {
      const courseTask = await courseService.getCourseTaskById(req.params.courseId);
      res.status(StatusCodes.OK).json(courseTask);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/tasks/{id} [PUT]
   * @returns HttpStatus ok and @CourseTask
   */
  editCourseTask: async (req, res, next) => {
    try {
      const courseTask = await courseService.editCourseTask(req.body, req.params.id);
      res.status(StatusCodes.OK).json(courseTask);
    } catch (e) {
      next(e);
    }
  },
  
  /**
   * /courses/tasks/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
  */
  deleteCourseTask: async (req, res, next) => {
    try {
      await courseService.deleteCourseTask(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/tasks/{courseTaskId}/students [PUT]
   * @returns HttpStatus ok
   */
  setStudentsToTask: async (req, res, next) => {
    try {
      await courseService.setStudentsToTask(req.body, req.params.courseTaskId);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/tasks/{courseTaskId}/students [GET]
   * @returns HttpStatus ok
   */
  getStudentsTasks: async (req, res, next) => {
    try {
      const students = await courseService.getStudentsByCourseTask(req.params.courseTaskId);
      res.status(StatusCodes.OK).json(students);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /courses/tasks/{courseTaskId}/students/{studentId} [PUT]
   * @returns HttpStatus ok
   */
  setCompletedStudentTask: async (req, res, next) => {
    try {
      const course = await courseService.setCompletedStudentTask(req.body, req.params.courseTaskId, req.params.studentId);
      res.status(StatusCodes.OK).json(course);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /calc-professors-payments [POST]
   * @returns HttpStatus ok
   */
  calcProfessorsPayments: async (req, res, next) => {
    try {
      const details = await courseService.calcProfessorsPayments(req.body.from, req.body.to);
      res.status(StatusCodes.OK).json(details);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },

  /**
   * /add-professor-payment [POST]
   * @returns HttpStatus ok
   */
  addProfessorPayment: async (req, res, next) => {
    try {
      const added = await courseService.addProfessorPayment(req.body, req.user.id);
      const message = added ? "ADDED" : "ALREADY_EXITS";
      res.status(StatusCodes.OK).json({ message });
    } catch (e) {
      next(e);
    }
  },

};