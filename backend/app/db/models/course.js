import { Sequelize } from "sequelize";

const course = (sequelize) => {
  const course = sequelize.define("course", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: Sequelize.STRING,
    needsRegistration: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isCircular: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    description: Sequelize.STRING,
    startAt: { type: Sequelize.DataTypes.DATE, allowNull: true, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    endAt: { type: Sequelize.DataTypes.DATE, allowNull: true, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  }, {});
  course.associate = function (models) {
    // associations can be defined here
  };
  return course;
};

export default course;