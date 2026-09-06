import verifyApiKey from "./verifyApiKey.js";
import verifyToken from "./validateToken.js";

const verifyTokenOrApiKey = async (req, res, next) => {
  if (req.headers["x-api-key"]) {
    return verifyApiKey(req, res, next);
  }
  return verifyToken(req, res, next);
};

export default verifyTokenOrApiKey;
