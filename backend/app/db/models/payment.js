import { Sequelize } from "sequelize";

const payment = (sequelize) => {
  const payment = sequelize.define("payment", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
  }, {});
  payment.associate = function (models) {
    // associations can be defined here
  };
  return payment;
};

export default payment;