import { Sequelize } from "sequelize";

const courseTask = (sequelize) => {
  const courseTask = sequelize.define("courseTask", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    comment: Sequelize.STRING,
    limitDate: Sequelize.DataTypes.DATE,
  }, { tableName: "course_task" });
  courseTask.associate = function (models) {
    // associations can be defined here
  };
  return courseTask;
};

export default courseTask;