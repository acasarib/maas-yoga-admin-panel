import { Sequelize } from "sequelize";

const professor = (sequelize) => {
  const professor = sequelize.define("professor", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: { type: Sequelize.STRING, allowNull: false },
    lastName: { type: Sequelize.STRING, allowNull: false },
    phoneNumber: { type: Sequelize.STRING, allowNull: false, defaultValue:'' },
    email: { type: Sequelize.STRING, allowNull: false, defaultValue:'' },
    invoiceType: { type: Sequelize.STRING, allowNull: false, defaultValue:'' },
  }, {});
  professor.associate = function (models) {
    // associations can be defined here
  };
  return professor;
};

export default professor;