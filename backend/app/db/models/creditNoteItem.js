import { Sequelize } from "sequelize";

const creditNoteItem = (sequelize) => {
  const creditNoteItem = sequelize.define("creditNoteItem", {
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
  creditNoteItem.associate = function (models) {
    // associations can be defined here
  };
  return creditNoteItem;
};

export default creditNoteItem;
