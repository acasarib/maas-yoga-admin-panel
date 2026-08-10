import { Sequelize } from "sequelize";

const invoice = (sequelize) => {
  const invoice = sequelize.define("invoice", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    invoiceType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    invoiceNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    puntoVenta: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    cae: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    caeVencimiento: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    totalAmount: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    ivaCondition: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cuit: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }, {});
  invoice.associate = function (models) {
    // associations can be defined here
  };
  return invoice;
};

export default invoice;
