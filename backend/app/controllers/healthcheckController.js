import * as healthcheckService from "../services/healthcheckService.js";

export default {
  /**
   * /healthcheck [GET]
   * @returns 200 and healthcheck
   */
  getHealthcheck: async (req, res) => {
    const checkCert = req.query.checkCert === 'true';
    const healthcheck = await healthcheckService.getHealthcheck(checkCert);
    res.status(200).json(healthcheck);
  },

};