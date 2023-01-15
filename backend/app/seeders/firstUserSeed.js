import { user } from "../db/index.js";
import bcrypt from "bcrypt";
import { FIRST_USER_PASSWORD, FIRST_USER_EMAIL } from "../utils/constants.js";

const createFirstUserIfNotExists = async () => {
  const countUsers = await user.count();
  if (countUsers === 0) {
    console.log("no users founds, creating first user");
    const encryptedPassword = await bcrypt.hash(FIRST_USER_PASSWORD, 10);
    await user.create({
      email: FIRST_USER_EMAIL,
      password: encryptedPassword,
      permissionCreateUser: true,
    });
    console.log("first user created");
  }
};

export default createFirstUserIfNotExists;