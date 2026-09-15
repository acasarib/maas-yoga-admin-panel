import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

const tooManyRequests = (req, res) => {
  res.status(StatusCodes.TOO_MANY_REQUESTS).json({
    message: "Demasiados intentos de inicio de sesión. Intente nuevamente en unos minutos.",
  });
};

// Frena fuerza bruta contra una sola cuenta desde múltiples IPs (credential stuffing)
export const loginRateLimiterByAccount = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body?.email || "").toLowerCase() || ipKeyGenerator(req.ip),
  handler: tooManyRequests,
});

// Frena a un atacante probando muchas cuentas distintas desde la misma IP (spraying)
export const loginRateLimiterByIp = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests,
});
