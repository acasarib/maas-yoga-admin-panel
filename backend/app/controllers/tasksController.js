import * as taskService from "../services/taskService.js";
import { StatusCodes } from "http-status-codes";
import Specification from "../models/Specification.js";
import { task } from "../db/index.js";

export default {
  /**
   * /tasks [POST]
   * @returns HttpStatus created and @Task
   */
  create: async (req, res, next) => {
    try {
      const createdTask = await taskService.create(req.body);
      res.status(StatusCodes.CREATED).json(createdTask);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /tasks/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await taskService.deleteById(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /tasks/{id} [PUT]
   * @returns HttpStatus ok if was edited
   */
  editById: async (req, res, next) => {
    try {
      await taskService.editById(req.body, req.params.id);
      res.status(StatusCodes.OK).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /tasks/{id} [GET]
   * @returns HttpStatus ok and @Task
   */
  getById: async (req, res, next) => {
    try {
      const task = await taskService.getById(req.params.id);
      if (task)
        res.status(StatusCodes.OK).json(task);
      else
        res.status(StatusCodes.NOT_FOUND).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /tasks [GET]
   * @returns HttpStatus ok and array of @Tasks
   */
  getAll: async (req, res, next) => {
    try {
      const querySpecification = req.query.q;
      const specification = new Specification(querySpecification, task);
      const tasks = await taskService.getAll(specification);
      res.status(StatusCodes.OK).json(tasks);
    } catch (e) {
      next(e);
    }
  },

};