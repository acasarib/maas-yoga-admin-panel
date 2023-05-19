import { Sequelize } from "sequelize";

const clazz = (sequelize) => {
  const clazz = sequelize.define("clazz", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: { type: Sequelize.STRING, allowNull: false },
    endAt: { type: Sequelize.DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    professor: { type: Sequelize.STRING, allowNull: false },
    startAt: { type: Sequelize.DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    paymentsVerified: { type: Sequelize.BOOLEAN, allowNull: false },
  }, {});
  clazz.associate = function (models) {
    // associations can be defined here
  };
  return clazz;
};

export default clazz;