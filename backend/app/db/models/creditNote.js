import { Sequelize } from "sequelize";

const creditNote = (sequelize) => {
  const creditNote = sequelize.define("creditNote", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    creditNoteType: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    creditNoteNumber: {
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
    // Motivo de la nota de crédito (texto libre, ej: "Error de carga", "Devolución parcial").
    reason: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }, {});
  creditNote.associate = function (models) {
    // associations can be defined here
  };
  return creditNote;
};

export default creditNote;
