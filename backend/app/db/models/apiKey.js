import { Sequelize } from "sequelize";

const apiKey = (sequelize) => {
  const apiKey = sequelize.define("apiKey", {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    keyPrefix: { type: Sequelize.STRING, allowNull: false, unique: true },
    keyHash: { type: Sequelize.STRING, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    permissions: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
    lastUsedAt: { type: Sequelize.DATE, allowNull: true },
  }, {});
  apiKey.associate = function () {};
  return apiKey;
};

export default apiKey;
