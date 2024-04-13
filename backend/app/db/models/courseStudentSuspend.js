import { Sequelize } from "sequelize";

const courseStudentSuspend = (sequelize) => {
  const courseStudentSuspend = sequelize.define("courseStudentSuspend", {
    studentId: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    courseId: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    suspendedAt: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
    suspendedEndAt: { type: Sequelize.STRING, allowNull: true },
  }, { tableName: "student_course_suspend", timestamps: false });
  courseStudentSuspend.associate = function (models) {
    // associations can be defined here
  };
  return courseStudentSuspend;
};

export default courseStudentSuspend;