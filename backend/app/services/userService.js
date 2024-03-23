import { user } from "../db/index.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import request from "request";

export const create = async (userParam) => {
  const encryptedPassword = await encryptPassword(userParam.password);
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
  let userDb = await user.scope("withPassword").findOne({ where: { email } });
  if (!userDb)
    throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "invalid email or password" });
  if (userDb.password == null) {
    await changePassword(userDb.email, password);
    userDb = await user.scope("withPassword").findOne({ where: { email } });
  }
  const result = bcrypt.compareSync(password, userDb.password);
  if (!result)
    throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "invalid email or password" });
  const claims = {
    id: userDb.id,
    firstName: userDb.firstName,
    lastName: userDb.lastName,
    email: userDb.email,
    permissions: getUserPermissions(userDb.dataValues)
  };

  
  if (userDb.permissionGoogleDrive) {
    claims.googleDriveCredentials = await getGoogleDriveCredentials();
  }
  return jwt.sign(claims, process.env.BACKEND_TOKEN_SECRET, {
    expiresIn: parseInt(process.env.BACKEND_TOKEN_EXPIRATION_TIME_MILISECONDS)
  });
};

export const getAll = async () => {
  return user.findAll();
};

export const editByEmail = async (email, userParam) => {
  if ("password" in userParam && userParam.password != null) {
    userParam.password = await encryptPassword(userParam.password);
  }
  await user.update(userParam, { where: { email } });
  return user.findOne({ where: { email } });
};

function getUserPermissions(user) {
  const permissionsKeys = Object.keys(user).filter(key => key.startsWith("permission") && user[key]);
  return permissionsKeys.map(permission => permission.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase());
}

async function encryptPassword(password) {
  return bcrypt.hash(password, 10);
}

async function changePassword(email, newPassword) {
  return editByEmail(email, { password: newPassword });
}

function getGoogleDriveCredentials() {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      url: "https://www.googleapis.com/oauth2/v3/token",
      formData : {
        "grant_type" : "refresh_token",
        "client_id": process.env.GOOGLE_CLIENT_ID,
        "client_secret": process.env.GOOGLE_CLIENT_SECRET,
        "refresh_token": process.env.GOOGLE_CLIENT_REFRESH_TOKEN,
      }
    };
  
    request(options, (err, res, body) => {
      if(err) {
        reject({err, res, body});
      }
      resolve({
        clientId: process.env.GOOGLE_CLIENT_ID,
        token: JSON.parse(body).access_token,
        apiKey: process.env.GOOGLE_API_KEY,
      });
    });
  });
}