import { Sequelize } from "sequelize";

const headquarter = (sequelize) => {
  const headquarter = sequelize.define("headquarter", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: Sequelize.STRING,
    location: Sequelize.STRING,
  }, {});
  headquarter.associate = function (models) {
    // associations can be defined here
  };
  return headquarter;
};

export default headquarter;