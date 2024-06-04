import { Sequelize } from "sequelize";

const notificationPayment = (sequelize) => {
  const notificationPayment = sequelize.define("notificationPayment", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
  }, { tableName: "notification_payment" });
  notificationPayment.associate = function (models) {
    // associations can be defined here
  };
  return notificationPayment;
};

export default notificationPayment;