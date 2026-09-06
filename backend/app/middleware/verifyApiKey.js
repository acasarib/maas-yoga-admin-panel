import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { apiKey, user } from "../db/index.js";

const verifyApiKey = async (req, res, next) => {
  const keyHeader = req.headers["x-api-key"];

  if (!keyHeader) {
    return next();
  }

  try {
    const keyPrefix = keyHeader.slice(0, 20);
    const foundKey = await apiKey.findOne({
      where: { keyPrefix },
      include: [{ model: user, required: false }],
    });

    if (!foundKey) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or disabled API Key" });
    }

    if (!foundKey.user || foundKey.user.status !== "active") {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid or disabled API Key" });
    }

    const isValid = await bcrypt.compare(keyHeader, foundKey.keyHash);
    if (!isValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid API Key" });
    }

    await foundKey.update({ lastUsedAt: new Date() });

    req.user = {
      id: foundKey.user.id,
      email: foundKey.user.email,
      firstName: foundKey.user.firstName,
      lastName: foundKey.user.lastName,
      role: foundKey.user.role,
    };
    req.apiKey = { id: foundKey.id, permissions: foundKey.permissions };

    next();
  } catch (error) {
    console.error("[verifyApiKey] Error:", error.message);
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication failed" });
  }
};

export default verifyApiKey;
