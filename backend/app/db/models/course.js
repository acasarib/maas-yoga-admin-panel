import { Sequelize } from "sequelize";

const course = (sequelize) => {
  const course = sequelize.define("course", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    startAt: Sequelize.DataTypes.DATE,
    duration: Sequelize.STRING,
  }, {});
  course.associate = function (models) {
    // associations can be defined here
  };
  return course;
};

export default course;