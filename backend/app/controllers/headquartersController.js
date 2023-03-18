import * as headquarterService from "../services/headquarterService.js";
import { StatusCodes } from "http-status-codes";
import Specification from "../models/Specification.js";
import { headquarter } from "../db/index.js";

export default {
  /**
   * /headquarters [POST]
   * @returns HttpStatus created and @Headquarter
   */
  create: async (req, res, next) => {
    try {
      const createdHeadquarter = await headquarterService.create(req.body);
      res.status(StatusCodes.CREATED).json(createdHeadquarter);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /headquarters/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await headquarterService.deleteById(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /headquarters/{id} [PUT]
   * @returns HttpStatus ok if was edited
   */
  editById: async (req, res, next) => {
    try {
      await headquarterService.editById(req.body, req.params.id);
      res.status(StatusCodes.OK).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /headquarters/{id} [GET]
   * @returns HttpStatus ok and @Headquarter
   */
  getById: async (req, res, next) => {
    try {
      const headquarter = await headquarterService.getById(req.params.id);
      if (headquarter)
        res.status(StatusCodes.OK).json(headquarter);
      else
        res.status(StatusCodes.NOT_FOUND).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /headquarters [GET]
   * @returns HttpStatus ok and array of @Headquarter
   */
  getAll: async (req, res, next) => {
    try {
      const querySpecification = req.query.q;
      const specification = new Specification(querySpecification, headquarter);
      const headquarters = await headquarterService.getAll(specification);
      res.status(StatusCodes.OK).json(headquarters);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /headquarters/{id}/courses [PUT]
   * @returns HttpStatus ok and @Headquarter
   */
  setCoursesToHeadquarter: async (req, res, next) => {
    try {
      const headquarter = await headquarterService.setCoursesToHeadquarter(req.body, req.params.id);
      res.status(StatusCodes.OK).json(headquarter);
    } catch (e) {
      next(e);
    }
  },

};