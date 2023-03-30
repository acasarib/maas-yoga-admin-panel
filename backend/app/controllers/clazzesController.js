import * as clazzService from "../services/clazzService.js";
import { StatusCodes } from "http-status-codes";
import Specification from "../models/Specification.js";
import { clazz } from "../db/index.js";

export default {
  /**
   * /clazz [POST]
   * @returns HttpStatus created and @Clazz
   */
  create: async (req, res, next) => {
    try {
      req.body.paymentsVerified = false;
      const createdClazz = await clazzService.create(req.body);
      res.status(StatusCodes.CREATED).json(createdClazz);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /clazzes/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await clazzService.deleteById(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /clazzes/{id} [PUT]
   * @returns HttpStatus ok if was edited
   */
  editById: async (req, res, next) => {
    try {
      await clazzService.editById(req.body, req.params.id);
      res.status(StatusCodes.OK).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /clazzes/{id} [GET]
   * @returns HttpStatus ok and @Clazz
   */
  getById: async (req, res, next) => {
    try {
      const clazz = await clazzService.getById(req.params.id);
      if (clazz)
        res.status(StatusCodes.OK).json(clazz);
      else
        res.status(StatusCodes.NOT_FOUND).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /clazzes [GET]
   * @returns HttpStatus ok and array of @Clazz
   */
  getAll: async (req, res, next) => {
    try {
      const querySpecification = req.query.q;
      const specification = new Specification(querySpecification, clazz);
      const clazzes = await clazzService.getAll(specification);
      res.status(StatusCodes.OK).json(clazzes);
    } catch (e) {
      next(e);
    }
  },

};