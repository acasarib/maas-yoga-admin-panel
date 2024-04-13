import { Sequelize } from "sequelize";

const payment = (sequelize) => {
  const payment = sequelize.define("payment", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    oldId: Sequelize.INTEGER,
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    discount: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    at: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    },
    operativeResult: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    },
    periodFrom: {
      type: Sequelize.DataTypes.DATEONLY,
      allowNull: true,
    },
    periodTo: {
      type: Sequelize.DataTypes.DATEONLY,
      allowNull: true,
    },
    driveFileId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    verified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isRegistrationPayment: {
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