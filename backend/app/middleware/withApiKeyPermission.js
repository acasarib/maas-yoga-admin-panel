import { StatusCodes } from "http-status-codes";

const withApiKeyPermission = (requiredPermissions = []) => {
  const perms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return (req, res, next) => {
    if (!req.apiKey) {
      return next();
    }

    const hasPermission = perms.some(perm => req.apiKey.permissions.includes(perm));
    if (!hasPermission) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Insufficient permissions",
        required: perms,
        granted: req.apiKey.permissions,
      });
    }

    next();
  };
};

export default withApiKeyPermission;
