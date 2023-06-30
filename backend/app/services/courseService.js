import { Op } from "sequelize";
import utils from "../utils/functions.js";
import { course, student, courseTask, studentCourseTask, payment } from "../db/index.js";
import { CRITERIA_COURSES, PAYMENT_TYPES } from "../utils/constants.js";

const getCollectedByStudent = professorPayment => {
  const amountByStudent = parseFloat(professorPayment.criteriaValue);
  return amountByStudent * professorPayment.totalStudents;
}

const getCollectedByPercentage = professorPayment => {
  const percentage = parseFloat(professorPayment.criteriaValue);
  const total = professorPayment.collectedByPayments;
  return (percentage / 100) * total;
}

export const create = async (courseParam) => {
  return course.create(courseParam);
};

export const deleteById = async (id) => {
  course.destroy({ where: { id } });
};

export const editById = async (courseParam, id) => {
  return course.update(courseParam, { where: { id } });
};

export const getById = async (id) => {
  return course.findByPk(id, { include: [student, courseTask] });
};

export const getAll = async () => {
  return course.findAll({ include: [
    student,
    { model: courseTask, include:[student] },
  ]});
};

export const setStudentsToCourse = async (students, courseId) => {
  const courseDb = await course.findByPk(courseId, { include: [student] });
  const studentsDb = await student.findAll({ where: { id: students } });
  await courseDb.setStudents(studentsDb, { through: "course_student" });
  const courseTasks = await courseTask.findAll({ where: { courseId } });
  courseTasks.forEach(cTask => cTask.setStudents(studentsDb));
  return course.findByPk(courseId, { include: [student] });
};

export const addCourseTask = async (courseTaskParam, courseId) => {
  courseTaskParam.courseId = courseId;
  const courseDb = await course.findByPk(courseId, { include: [student] });
  const courseTaskCreated = await courseTask.create(courseTaskParam);
  await courseTaskCreated.setStudents(courseDb.students, { through: studentCourseTask });
  return courseTaskCreated;
};

export const getTasksByCourseId = async (courseId, specification) => {
  return courseTask.findAll({
    where: {
      ...specification.getSequelizeSpecification(),
      courseId
    },
    include: [student],
  });
};

export const editCourseTask = async (courseTaskParam, id) => {
  return courseTask.update(courseTaskParam, { where: { id } });
};

export const deleteCourseTask = async (id) => {
  courseTask.destroy({ where: { id } });
};

export const setStudentsToTask = async (students, courseTaskId) => {
  const courseTaskDb = await courseTask.findByPk(courseTaskId);
  await courseTaskDb.setStudents(students, { through: studentCourseTask });
};

export const getStudentsByCourseTask = async (courseTaskId) => {
  return studentCourseTask.findAll({
    where: { courseTaskId }
  })
};

export const setCompletedStudentTask = async (studentCourseTaskParam, courseTaskId, studentId) => {
  studentCourseTask.update(studentCourseTaskParam, { where: { courseTaskId, studentId } })
};

/**
 * 
 * @param {String} from in format yyyy-mm-dd
 * @param {String} to in format yyyy-mm-dd
 */
export const calcProfessorsPayments = async (from, to) => {
  const startDate = new Date(from);
  const endDate = new Date(to);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  const paymentsInRange = await payment.findAll({
    where: {
      at: {
        [Op.between]: [startDate, endDate]
      },
      courseId: {
        [Op.not]: null
      }
    }
  });
  let coursesIds = paymentsInRange.map(payment => payment.courseId);
  coursesIds = utils.removeDuplicated(coursesIds);
  const coursesInRange = await course.findAll({
    where: {
      id: {
        [Op.in]: coursesIds
      }
    }
  });
  const professorsPayments = coursesInRange.map(c => {
    let currentPayment = { criteria: c.criteria, criteriaValue: c.criteriaValue };
    currentPayment.courseId = c.id;
    currentPayment.payments = paymentsInRange.filter(p => p.courseId === c.id);
    currentPayment.collectedByPayments = currentPayment.payments.reduce((total, p) => total + p.value, 0);
    currentPayment.totalStudents = currentPayment.payments.map(p => p.studentId);
    currentPayment.totalStudents = utils.removeDuplicated(currentPayment.totalStudents).length;
    currentPayment.collectedByProfessor = c.criteria === CRITERIA_COURSES.STUDENT ? getCollectedByStudent(currentPayment) : getCollectedByPercentage(currentPayment);
    currentPayment.professor = c.professor;

    return currentPayment;
  });
  return professorsPayments;
}

export const addProfessorPayments = async (data, from, to, informerId = null) => {
  const payments = data.map(d => ({
    type: PAYMENT_TYPES.CASH,
    value: d.collectedByProfessor *-1,
    at: new Date(),
    verified: false,
    note: "",
    courseId: d.courseId,
    periodFrom: new Date(from),
    periodTo: new Date(to),
    professor: d.professor,
    userId: informerId,
  }));
  let paymentsAdded = 0;
  for (const p of payments) {
    const alreadyCalculated = await payment.count({
      where: {
        periodFrom: from,
        periodTo: to,
        professor: p.professor,
      }
    });
    if (alreadyCalculated === 0) {
      paymentsAdded++;
      await payment.create(p);
    }
  }
  return paymentsAdded;
}

export const addProfessorPayment = async (payment, from, to, informerId) => {
  const amountAdded = await addProfessorPayments([payment], from, to, informerId);
  return amountAdded === 1;
}