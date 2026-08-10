import { Sequelize } from "sequelize";

const invoiceItem = (sequelize) => {
  const invoiceItem = sequelize.define("invoiceItem", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    concept: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Servicio",
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
  }, {});
  invoiceItem.associate = function (models) {
    // associations can be defined here
  };
  return invoiceItem;
};

export default invoiceItem;
