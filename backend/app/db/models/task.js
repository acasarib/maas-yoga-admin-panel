import { Sequelize } from "sequelize";

const task = (sequelize) => {
  const task = sequelize.define("task", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    completed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  }, {});
  task.associate = function (models) {
    // associations can be defined here
  };
  return task;
};

export default task;