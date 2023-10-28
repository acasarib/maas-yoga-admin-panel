import { Sequelize } from "sequelize";

const courseStudent = (sequelize) => {
  const courseStudent = sequelize.define("courseStudent", {
  
  }, { tableName: "course_student" });
  courseStudent.associate = function (models) {
    // associations can be defined here
  };
  return courseStudent;
};

export default courseStudent;