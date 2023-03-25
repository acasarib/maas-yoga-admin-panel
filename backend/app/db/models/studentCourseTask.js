import { Sequelize } from "sequelize";

const studentCourseTask = (sequelize) => {
  const studentCourseTask = sequelize.define("studentCourseTask", {
    completed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  }, { tableName: "student_course_task" });
  studentCourseTask.associate = function (models) {
    // associations can be defined here
  };
  return studentCourseTask;
};

export default studentCourseTask;