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
    at: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    },
    verified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    note: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "",
    },
  }, {});
  payment.associate = function (models) {
    // associations can be defined here
  };
  return payment;
};

export default payment;