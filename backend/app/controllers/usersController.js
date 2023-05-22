import * as userService from "../services/userService.js";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";

export default {
  /**
   * /users/register [POST]
   * @returns HttpStatus created and @User
   * @returns HttpStatus bad request if email already exists
   */
  register: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        throw ({ statusCode: StatusCodes.BAD_REQUEST, message: errors.array() });
      const user = await userService.create(req.body);
      user.password = undefined;
      res.status(StatusCodes.CREATED).json(user);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /users/{email} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteByEmail: async (req, res, next) => {
    try {
      await userService.deleteByEmail(req.params.email);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /users/login [POST]
   * @returns JWT token
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await userService.login(email, password);
      res.status(StatusCodes.OK).json({ token });
    } catch (e) {
      next(e);
    }
  },

  /**
   * / [GET]
   * @returns HttpStatus ok and array of @Template
   */
  getAll: async (req, res, next) => {
    try {
      const users = await userService.getAll();
      res.status(StatusCodes.OK).json(users);
    } catch (e) {
      next(e);
    }
  },

};