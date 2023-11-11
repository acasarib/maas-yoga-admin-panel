import { Op } from "sequelize";
import utils from "../utils/functions.js";
import { StatusCodes } from "http-status-codes";
import { course, student, courseTask, studentCourseTask, payment, professorCourse, professor } from "../db/index.js";
import { CRITERIA_COURSES, PAYMENT_TYPES } from "../utils/constants.js";

const paymentBelongToProfessor = (payment, professor) => {
  try {
    const paymentDate = payment.operativeResult;
    return professor.dataValues.periods.find(period => {
      const from = new Date(period.startAt);
      const to = new Date(period.endAt);
      to.setHours(23, 59, 59, 999);
      return from <= paymentDate && to >= paymentDate;
    }); 
  } catch {
    return false;
  }
};

const getProfessorPeriodsInCourse = async (courseId) => {
  const rawPeriods = await professorCourse.findAll({ where: { courseId } });
  const professorsIds = rawPeriods.map(p => p.professorId);
  const payments = await payment.findAll({ where: { courseId, professorId: professorsIds } });
  const professors = await professor.findAll({ where: { id: professorsIds } });
  professors.forEach(prof => {
    prof.dataValues.periods = [];
    rawPeriods.forEach(period => {
      if (period.professorId == prof.id) {
        prof.dataValues.periods.push({
          id: period.id,
          startAt: period.startAt,
          endAt: period.endAt,
          criteria: period.criteria,
          criteriaValue: period.criteriaValue,
        });
      }
    });
    prof.dataValues.payments = [];
    payments.forEach(payment => {
      if (payment.professorId === prof.id) {
        prof.dataValues.payments.push(payment);
      }
    });
  });
  return professors;
};

const checkOverlappingProfessorsPeriods = (professors) => {
  const professorMap = {};

  for (const prof of professors) {
    const { professorId, startAt, endAt } = prof;
    const isValidRange = startAt <= endAt;
    if (!isValidRange) {
      throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "invalid range for professor id="+professorId+ " verify that startAt < endAt" });
    }
    if (!professorMap[professorId]) {
      professorMap[professorId] = [{ startAt, endAt }];
    } else {
      const existingProfRanges = professorMap[professorId];
      for (const range of existingProfRanges) {
        const isOverlapping = (startAt > range.startAt && startAt < range.endAt) 
                           || (endAt > range.startAt && endAt < range.endAt)
                           || (startAt < range.startAt && endAt > range.endAt);
        if (isOverlapping) {
          throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "overlapping in professor id="+professorId });
        }
      }
    }
  }
};

const createProfessorCourse = async (courseId, professorsCourseParam) => {
  professorsCourseParam.forEach(pc => pc.courseId = courseId);
  await professorCourse.bulkCreate(professorsCourseParam);
};

const getCollectedByStudent = (professorPayment, criteriaValue) => {
  const amountByStudent = parseFloat(criteriaValue);
  return amountByStudent * professorPayment.totalStudents;
};

const getCollectedByPercentage = (professorPayment, criteriaValue) => {
  const percentage = parseFloat(criteriaValue);
  const total = professorPayment.collectedByPayments;
  return (percentage / 100) * total;
};

export const create = async (courseParam) => {
  const createdCourse = await course.create(courseParam);
  if ("professors" in courseParam) {
    checkOverlappingProfessorsPeriods(courseParam.professors);
    await createProfessorCourse(createdCourse.id, courseParam.professors);
  }
  return getById(createdCourse.id);
};

export const deleteById = async (id) => {
  course.destroy({ where: { id } });
};

export const editById = async (courseParam, id) => {
  await course.update(courseParam, { where: { id } });
  if ("professors" in courseParam) {
    checkOverlappingProfessorsPeriods(courseParam.professors);
    professorCourse.destroy({ where: { courseId: id } });
    await createProfessorCourse(id, courseParam.professors);
  }
  return getById(id);
};

export const getById = async (id) => {
  const c = await course.findByPk(id, { include: [student, courseTask] });
  const professorsWithPeriods = await getProfessorPeriodsInCourse(c.id);
  c.dataValues.professors = professorsWithPeriods;
  return c;
};

export const getAll = async () => {
  let courses = course.findAll({ include: [
    student,
    { model: courseTask, include:[student] },
  ]});
  let professorCourses = professorCourse.findAll();
  courses = await courses;
  professorCourses = await professorCourses;
  courses.forEach(course => {
    course.dataValues.periods = professorCourses.filter(pc => pc.courseId == course.id);
  });
  return courses;
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
  });
};

export const setCompletedStudentTask = async (studentCourseTaskParam, courseTaskId, studentId) => {
  studentCourseTask.update(studentCourseTaskParam, { where: { courseTaskId, studentId } });
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
      operativeResult: {
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
  for (const c of coursesInRange) {
    c.professors = await getProfessorPeriodsInCourse(c.id);
  }
  
  for (const paymentRange of paymentsInRange) {
    const paidCourse = coursesInRange.find(c => c.id == paymentRange.courseId);
    for (const prof of paidCourse.professors) {
      const paidPeriod = paymentBelongToProfessor(paymentRange, prof);
      if (paidPeriod) {
        if (!("result" in prof)) {
          prof.result = {
            payments: [],
            period: paidPeriod,
          };
        }
        prof.result.payments.push(paymentRange);
      }
    }
  }
  for (const course of coursesInRange) {
    course.dataValues.collectedByPayments = paymentsInRange
      .filter(p => p.courseId == course.id)
      .reduce((total, p) => total + p.value, 0);
    for (const prof of course.professors) {
      if ("result" in prof) {
        prof.result.courseId = course.id;
        prof.result.criteria = prof.criteria;
        prof.result.criteriaValue = prof.criteriaValue;
        prof.result.collectedByPayments = prof.result.payments.reduce((total, p) => total + p.value, 0);
        prof.result.totalStudents = prof.result.payments.map(p => p.studentId);
        prof.result.totalStudents = utils.removeDuplicated(prof.result.totalStudents).length;
        prof.result.collectedByProfessor = prof.result.period.criteria === CRITERIA_COURSES.STUDENT
          ? getCollectedByStudent(prof.result, prof.result.period.criteriaValue) 
          : getCollectedByPercentage(prof.result, prof.result.period.criteriaValue);
        prof.dataValues.result = prof.result;
      }
    }
    course.dataValues.professors = course.professors; 
  }
  return coursesInRange;
};

export const addProfessorPayments = async (data, informerId = null) => {
  const payments = data.map(d => ({
    type: PAYMENT_TYPES.CASH,
    value: d.collectedByProfessor *-1,
    at: new Date(),
    verified: false,
    note: "",
    courseId: d.courseId,
    professorCourseId: d.professorCourseId,
    professorId: d.professorId,
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
};

export const addProfessorPayment = async (payment, from, to, informerId) => {
  const amountAdded = await addProfessorPayments([payment], from, to, informerId);
  return amountAdded === 1;
};