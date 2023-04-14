import { Sequelize } from "sequelize";

const item = (sequelize) => {
  const item = sequelize.define("item", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: Sequelize.STRING,
  }, {});
  item.associate = function (models) {
    // associations can be defined here
  };
  return item;
};

export default item;