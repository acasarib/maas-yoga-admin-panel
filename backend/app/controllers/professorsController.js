import * as professorService from "../services/professorService.js";
import { StatusCodes } from "http-status-codes";
import Specification from "../models/Specification.js";
import { professor } from "../db/index.js";

export default {
  /**
   * /prfessors [POST]
   * @returns HttpStatus created and @Professor
   */
  create: async (req, res, next) => {
    try {
      const createdProfessor = await professorService.create(req.body);
      res.status(StatusCodes.CREATED).json(createdProfessor);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /professors/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await professorService.deleteById(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /professors/{id} [PUT]
   * @returns HttpStatus ok if was edited
   */
  editById: async (req, res, next) => {
    try {
      await professorService.editById(req.body, req.params.id);
      res.status(StatusCodes.OK).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /professors/{id} [GET]
   * @returns HttpStatus ok and @Professor
   */
  getById: async (req, res, next) => {
    try {
      const professor = await professorService.getById(req.params.id);
      if (professor)
        res.status(StatusCodes.OK).json(professor);
      else
        res.status(StatusCodes.NOT_FOUND).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /professors [GET]
   * @returns HttpStatus ok and array of @Professor
   */
  getAll: async (req, res, next) => {
    try {
      const querySpecification = req.query.q;
      const specification = new Specification(querySpecification, professor);
      const professors = await professorService.getAll(specification);
      res.status(StatusCodes.OK).json(professors);
    } catch (e) {
      next(e);
    }
  },

};