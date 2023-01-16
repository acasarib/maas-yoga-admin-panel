import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

const verifyToken = (req, res, next) => {
  try {
    const token = req.header("authorization").split("Bearer ")[1];
    if (!token) return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Access denied" });
    const verified = jwt.verify(token, process.env.BACKEND_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({error: "Invalid token"});
  }
};

export default verifyToken;