import { Sequelize } from "sequelize";

const secretaryPayment = (sequelize) => {
  const secretaryPayment = sequelize.define("secretaryPayment", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    salary: Sequelize.FLOAT,
    monotributo: Sequelize.FLOAT,
    extraTasks: Sequelize.FLOAT,
    extraHours: Sequelize.FLOAT,
    sac: Sequelize.FLOAT,

  }, {
    tableName: "secretary_payment",
    updatedAt: false,
  });
  secretaryPayment.associate = function (models) {
    // associations can be defined here
  };
  return secretaryPayment;
};

export default secretaryPayment;