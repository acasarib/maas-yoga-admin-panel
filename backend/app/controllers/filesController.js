import * as fileService from "../services/fileService.js";
import { StatusCodes } from "http-status-codes";
import stream from "stream";

export default {
  /**
   * /files [POST]
   * @returns HttpStatus created and id of the file
   */
  create: async (req, res, next) => {
    try {
      const { mimetype, originalname, buffer } = req.file;
      const uploadedFile = await fileService.create(mimetype, originalname, buffer);
      res.status(StatusCodes.CREATED).json({ id: uploadedFile.id });
    } catch (e) {
      next(e);
    }
  },

  /**
   * /files/{id} [GET]
   * @returns HttpStatus ok and @File in bytes
   */
  getById: async (req, res, next) => {
    try {
      const file = await fileService.getById(req.params.id);

      if (file) {
        const fileContents = Buffer.from(file.blob, "base64");
        const readStream = new stream.PassThrough();
        readStream.end(fileContents);

        res.set("Content-disposition", "attachment; filename=" + file.name);
        res.set("Content-Type", file.type);

        readStream.pipe(res);
      } else {
        res.status(StatusCodes.NOT_FOUND).send();
      }
    } catch (e) {
      next(e);
    }
  },

};