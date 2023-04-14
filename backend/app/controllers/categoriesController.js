import * as categoryService from "../services/categoryService.js";
import { StatusCodes } from "http-status-codes";

export default {
  /**
   * /categories [POST]
   * @returns HttpStatus created and @Category
   */
  create: async (req, res, next) => {
    try {
      const createdCategory = await categoryService.create(req.body);
      res.status(StatusCodes.CREATED).json(createdCategory);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /categories/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await categoryService.deleteById(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /categories/{id} [PUT]
   * @returns HttpStatus ok and @Category
   */
  editById: async (req, res, next) => {
    try {
      const editedCategory = await categoryService.editById(req.body, req.params.id);
      res.status(StatusCodes.OK).json(editedCategory);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /categories/{id} [GET]
   * @returns HttpStatus ok and @Category
   */
  getById: async (req, res, next) => {
    try {
      const category = await categoryService.getById(req.params.id);
      if (category)
        res.status(StatusCodes.OK).json(category);
      else
        res.status(StatusCodes.NOT_FOUND).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /categories [GET]
   * @returns HttpStatus ok and array of @Category
   */
  getAll: async (req, res, next) => {
    try {
      const categories = await categoryService.getAll();
      res.status(StatusCodes.OK).json(categories);
    } catch (e) {
      next(e);
    }
  },

};