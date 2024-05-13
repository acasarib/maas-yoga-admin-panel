import { Sequelize } from "sequelize";

const servicePayment = (sequelize) => {
  const servicePayment = sequelize.define("servicePayment", {
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
    discount: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    dayOfMonth: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "",
    },
    lastTimeAdded: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }, { tableName: "service_payment" });
  servicePayment.associate = function (models) {
    // associations can be defined here
  };
  return servicePayment;
};

export default servicePayment;