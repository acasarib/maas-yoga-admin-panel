import { StatusCodes } from "http-status-codes";

const blockAuditors = (req, res, next) => {
  try {
    if (req.user.role === 'auditor') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "Los auditores no tienen permiso para realizar esta acción"
      });
    }
    next();
  } catch (error) {
    console.error("[blockAuditors] Error:", error.message);
    res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
  }
};

export default blockAuditors;
