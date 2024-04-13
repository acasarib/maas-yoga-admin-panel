import { APP_VERSION } from "../utils/constants.js";

export const getHealthcheck = async () => {
  return { status: "UP", version: APP_VERSION };
};
