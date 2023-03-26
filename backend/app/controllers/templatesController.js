import * as templateService from "../services/templateService.js";
import { StatusCodes } from "http-status-codes";
import Specification from "../models/Specification.js";
import { headquarter } from "../db/index.js";

export default {
  /**
   * /templates [POST]
   * @returns HttpStatus created and @Template
   */
  create: async (req, res, next) => {
    try {
      const createdTemplate = await templateService.create(req.body);
      res.status(StatusCodes.CREATED).json(createdTemplate);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /templates/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await templateService.deleteById(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /templates/{id} [PUT]
   * @returns HttpStatus ok if was edited
   */
  editById: async (req, res, next) => {
    try {
      const editedTemplate = await templateService.editById(req.body, req.params.id);
      res.status(StatusCodes.OK).json(editedTemplate);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /templates/{id} [GET]
   * @returns HttpStatus ok and @Template
   */
  getById: async (req, res, next) => {
    try {
      const template = await templateService.getById(req.params.id);
      if (template)
        res.status(StatusCodes.OK).json(template);
      else
        res.status(StatusCodes.NOT_FOUND).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /templates [GET]
   * @returns HttpStatus ok and array of @Template
   */
  getAll: async (req, res, next) => {
    try {
      const querySpecification = req.query.q;
      const specification = new Specification(querySpecification, headquarter);
      const templates = await templateService.getAll(specification);
      res.status(StatusCodes.OK).json(templates);
    } catch (e) {
      next(e);
    }
  },

};