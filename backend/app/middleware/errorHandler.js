import {
  StatusCodes,
  ReasonPhrases,
} from "http-status-codes";

const errorHandler = (err, req, res, next) => {
  const errStatus = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const errMsg = err.message || ReasonPhrases.INTERNAL_SERVER_ERROR;
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === "development" ? err.stack : {}
  });
};

export default errorHandler;