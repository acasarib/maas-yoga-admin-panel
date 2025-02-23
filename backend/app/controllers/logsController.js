import * as logService from "../services/logService.js";
import { StatusCodes } from "http-status-codes";

export default {

  /**
   * /logs [GET]
   * @returns HttpStatus ok and array of @LogPayment
   */
  getAll: async (req, res, next) => {
    try {
      const { from, to, ...rest } = req.query;
      const logs = await logService.getAll(from, to, rest);
      res.status(StatusCodes.OK).json(logs);
    } catch (e) {
      next(e);
    }
  },

};