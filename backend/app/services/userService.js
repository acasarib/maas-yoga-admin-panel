import { user } from "../db/index.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const create = async (userParam) => {
  const encryptedPassword = await bcrypt.hash(userParam.password, 10);
  userParam.password = encryptedPassword;
  const userByEmail = await user.findOne({ where: { email: userParam.email } });
  if (userByEmail)
    throw ({ statusCode: StatusCodes.BAD_REQUEST, message: `Email ${userParam.email} already exists` });
  return user.create(userParam);
};

export const deleteByEmail = async (email) => {
  user.destroy({ where: { email } });
};

export const login = async (email, password) => {
  const userDb = await user.findOne({ where: { email } });
  if (!userDb)
    throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "invalid email or password" });
  const result = bcrypt.compareSync(password, userDb.password);
  if (result) {
    return jwt.sign({
      id: userDb.id,
      firstName: userDb.firstName,
      permissions: getUserPermissions(userDb.dataValues)
    }, process.env.BACKEND_TOKEN_SECRET, {
      expiresIn: parseInt(process.env.BACKEND_TOKEN_EXPIRATION_TIME_MILISECONDS)
    });
  } else {
    throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "invalid email or password" });
  }
};

function getUserPermissions(user) {
  const permissionsKeys = Object.keys(user).filter(key => key.startsWith("permission") && user[key]);
  return permissionsKeys.map(permission => permission.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase());
}