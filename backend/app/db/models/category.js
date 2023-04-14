import { Sequelize } from "sequelize";

const category = (sequelize) => {
  const category = sequelize.define("category", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: Sequelize.STRING,
  });
  category.associate = function (models) {
    // associations can be defined here
  };
  return category;
};

export default category;