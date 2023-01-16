import * as healthcheckService from "../services/healthcheckService.js";

export default {
  /**
   * /healthcheck [GET]
   * @returns 200 and healthcheck
   */
  getHealthcheck: async (req, res) => {
    const healthcheck = await healthcheckService.getHealthcheck();
    res.status(200).json(healthcheck);
  },

};