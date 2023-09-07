import { Sequelize } from "sequelize";

const logPayment = (sequelize) => {
  const logPayment = sequelize.define("logPayment", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    action: Sequelize.STRING,
  }, { 
    tableName: "log_payment",
  });
  logPayment.associate = function (models) {
    // associations can be defined here
  };
  return logPayment;
};

export default logPayment;