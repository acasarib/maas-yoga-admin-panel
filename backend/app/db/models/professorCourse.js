import { Sequelize } from "sequelize";

const professorCourse = (sequelize) => {
  const professorCourse = sequelize.define("professorCourse", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    startAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
    endAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
    criteria: Sequelize.STRING,
    criteriaValue: Sequelize.INTEGER,
  }, { 
    tableName: "professor_course",
    timestamps: false,
  });
  professorCourse.associate = function (models) {
    // associations can be defined here
  };
  return professorCourse;
};

export default professorCourse;