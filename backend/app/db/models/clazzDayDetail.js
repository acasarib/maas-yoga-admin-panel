import { Sequelize } from "sequelize";

const clazzDayDetail = (sequelize) => {
  const clazzDayDetail = sequelize.define("clazzDayDetail", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    day: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    startAt: { type: Sequelize.STRING, allowNull: false },
    endAt: { type: Sequelize.STRING, allowNull: false },
  }, { tableName: "clazz_day_detail", timestamps: false });
  clazzDayDetail.associate = function (models) {
    // associations can be defined here
  };
  return clazzDayDetail;
};

export default clazzDayDetail;