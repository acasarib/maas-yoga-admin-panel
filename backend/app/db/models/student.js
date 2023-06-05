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
    document: Sequelize.BIGINT,
    email: Sequelize.STRING,
    phoneNumber: Sequelize.STRING,
    cellPhoneNumber: Sequelize.STRING,
    contact: Sequelize.STRING,
    image:  Sequelize.STRING,
    alias: Sequelize.STRING,
    address: Sequelize.STRING,
    occupation: Sequelize.STRING,
    coverage: Sequelize.STRING,
  }, {});
  student.associate = function (models) {
    // associations can be defined here
  };
  return student;
};

export default student;