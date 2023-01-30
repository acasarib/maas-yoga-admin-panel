import { Sequelize } from "sequelize";

const student = (sequelize) => {
  const student = sequelize.define("student", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: Sequelize.STRING,
    lastName: Sequelize.STRING,
    document: Sequelize.INTEGER,
    email: Sequelize.STRING,
    phoneNumber: Sequelize.STRING,
  }, {});
  student.associate = function (models) {
    // associations can be defined here
  };
  return student;
};

export default student;