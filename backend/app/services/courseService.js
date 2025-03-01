import { Op } from "sequelize";
import utils from "../utils/functions.js";
import { StatusCodes } from "http-status-codes";
import { course, student, courseStudent, courseTask, studentCourseTask, payment, professorCourse, professor, sequelize } from "../db/index.js";
import { CRITERIA_COURSES, PAYMENT_TYPES } from "../utils/constants.js";
import { getStudentsByCourse } from "./studentService.js";

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
          courseValue: period.courseValue,
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

const getCollectedByStudent = (profData) => {
  let total = 0;
  const criteriaValue = parseFloat(profData.period.criteriaValue);
  const payments = profData.payments;
  for (const p of payments) {
    if (p.discount !== null) {
      total += criteriaValue * ( (100 - p.discount) / 100);
    } else {
      total += criteriaValue;
    }
  }
  return total;
};

const getLastProfessorPaymentPeriodInCourse = async (from, to, professorId, courseId) => {
  return payment.findOne({ where: {
    periodFrom: from,
    periodTo: to,
    professorId,
    courseId,
  },
  order: [["createdAt", "DESC"]],
  });
};

const paymentWasAddedAfterPreviousProfessorPayment = (lastProfessorPaymentAt, paymentRange) => {
  return paymentRange.createdAt > lastProfessorPaymentAt;
};

const getCollectedByPercentage = (profData, criteriaValue) => {
  const percentage = parseFloat(criteriaValue);
  const courseValue = profData.period.courseValue;
  let total = 0;
  const payments = profData.payments;
  for (const p of payments) {
    const discount = p.discount ?? 0;
    if (courseValue == null) {
      total += p.value;
    } else {
      total += courseValue * (1 - (discount / 100));
    }
  }
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
  const c = await course.findByPk(id, { include: [
    {
      model: courseTask, include:[{
        model: student,
        attributes: ["name", "lastName", "email"],
        through: { attributes: ["completed"] }
      }]
    },
    {
      model: payment,
      attributes: ["id", "operativeResult", "value", "periodFrom"]
    }] 
  });
  const professorsWithPeriods = await getProfessorPeriodsInCourse(c.id);
  c.dataValues.students = await getStudentsByCourse(c.id);
  c.dataValues.periods = [];
  for (const professor of professorsWithPeriods) {
    const professorPeriods = professor.dataValues.periods.map(pp => ({ ...pp, professorId: professor.id, professor }));
    c.dataValues.periods = [...c.dataValues.periods, ...professorPeriods];

  }
  return c;
};

export const getAll = async (title, page = 1, size = 10) => {
  const findAllParams = { include: [
    student,
    { model: courseTask, include:[student] },
  ],
  distinct: true,
  };
  if (title != undefined) {
    title = title.toLowerCase();
    findAllParams.where = { title: sequelize.where(sequelize.fn("LOWER", sequelize.col("course.title")), "LIKE", "%" + title + "%") };
  }
  findAllParams.limit = size;
  findAllParams.offset = (page - 1) * size;

  let { count, rows } = await course.findAndCountAll(findAllParams);
  let courses = rows;
  let coursesIds = courses.map(c => c.id);
  let professorCourses = await professorCourse.findAll({ include: [professor], where: { courseId: {[Op.in]:coursesIds}}});
  courses.forEach(course => {
    course.dataValues.periods = professorCourses.filter(pc => pc.courseId == course.id);
  });
  return {
    totalItems: count,
    totalPages: Math.ceil(count / size),
    currentPage: page,
    data: courses,
  };
};

export const setStudentsToCourse = async (students, courseId) => {
  const courseDb = await course.findByPk(courseId, { include: [student] });
  const studentsDb = await student.findAll({ where: { id: students } });
  await courseDb.setStudents(studentsDb, { through: "course_student" });
  const courseTasks = await courseTask.findAll({ where: { courseId } });
  courseTasks.forEach(cTask => cTask.setStudents(studentsDb));
  return course.findByPk(courseId, { include: [student] });
};

export const updateInscriptionDate = async (courseId, studentId, inscriptionDate) => {
  await courseStudent.update({ createdAt: inscriptionDate }, { where: { studentId, courseId }});
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

export const getCoursesTasksByTitle = async (title) => {
  return courseTask.findAll({
    attributes: [
      [sequelize.literal("DISTINCT ON (title) title"), "title"],
      "id",
      "comment",
      "limit_date",
    ],
    where: {
      title: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("title")),
        "LIKE",
        "%" + title.toLowerCase() + "%"
      ),
    },
    order: [["title", "ASC"], ["limit_date", "DESC"]],
    limit: 10,
  });
};

export const copyTasksFromCourse = async (sourceCourseId, targetCourseId) => {
  let tasksSourceCourse = await courseTask.findAll({
    where: { courseId: sourceCourseId },
  });
  tasksSourceCourse = tasksSourceCourse.map(task => task.get({plain: true}));
  tasksSourceCourse.forEach(task => {
    task.id = null;
    task.courseId = targetCourseId;
  });
  const targetCourse = await getById(targetCourseId);
  const studentsCourse = targetCourse.dataValues.students;
  await courseTask.bulkCreate(tasksSourceCourse);
  let createdIds = await courseTask.findAll({ where: { courseId: targetCourseId } });
  createdIds = createdIds.map(t => t.id);
  createdIds.forEach(taskId => {
    setStudentsToTask(studentsCourse, taskId);
  });
  return getById(targetCourseId);
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
export const calcProfessorsPayments = async (from, to, professorId, courseId) => {
  const startDate = new Date(from);
  const endDate = new Date(to);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  const paymentsInRange = await payment.findAll({
    where: {
      operativeResult: {
        [Op.between]: [startDate, endDate]
      },
      courseId: 
        courseId === undefined ? { [Op.not]: null }
          : { [Op.eq]: courseId },
      value: {
        [Op.gt]: 0
      },
      isRegistrationPayment: {
        [Op.eq]: false
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
    const professorPeriodsInCourse = await getProfessorPeriodsInCourse(c.id);
    if (professorId == undefined) {
      c.professors = professorPeriodsInCourse;
    } else {
      const prof = professorPeriodsInCourse.find(p => p.id == professorId);
      if (prof) {
        c.professors = [prof];
      } else {
        c.professors = [];
      }
    }
  }
  
  for (const paymentRange of paymentsInRange) {
    const paidCourse = coursesInRange.find(c => c.id == paymentRange.courseId);
    for (const prof of paidCourse.professors) {
      const paidPeriod = paymentBelongToProfessor(paymentRange, prof);
      if (paidPeriod) {
        if (!("result" in prof)) {
          const lastProfessorPayment = await getLastProfessorPaymentPeriodInCourse(from, to, prof.id, paymentRange.courseId);
          prof.result = {
            payments: [],
            period: paidPeriod,
            lastProfessorPaymentAt: lastProfessorPayment?.createdAt,
          };
        }
        const lastProfessorPaymentAt = prof.result.lastProfessorPaymentAt;
        if (lastProfessorPaymentAt) {
          if (paymentWasAddedAfterPreviousProfessorPayment(lastProfessorPaymentAt, paymentRange))
            prof.result.payments.push(paymentRange);
        } else {
          prof.result.payments.push(paymentRange);
        }
      }
    }
  }
  const isCriteriaByStudent = (criteria) => criteria === CRITERIA_COURSES.STUDENT || criteria === CRITERIA_COURSES.STUDENT_ASSISTANCE;
  for (const course of coursesInRange) {
    for (const prof of course.professors) {
      if ("result" in prof) {
        prof.result.courseId = course.id;
        prof.result.criteria = prof.criteria;
        prof.result.criteriaValue = prof.criteriaValue;
        prof.result.collectedByPayments = prof.result.payments.reduce((total, p) => total + p.value, 0);
        prof.result.totalStudents = prof.result.payments.map(p => p.studentId);
        prof.result.totalStudents = utils.removeDuplicated(prof.result.totalStudents).length;
        const criteria = prof.result.period.criteria;
        if (criteria == CRITERIA_COURSES.ASSISTANT) {
          prof.result.collectedByProfessor = prof.result.period.criteriaValue;
        } else {
          prof.result.collectedByProfessor = isCriteriaByStudent(prof.result.period.criteria)
            ? getCollectedByStudent(prof.result) 
            : getCollectedByPercentage(prof.result, prof.result.period.criteriaValue);
        }
        prof.dataValues.result = prof.result;
      }
    }
    course.dataValues.collectedByPayments = paymentsInRange.reduce((total, p) => course.id === p.courseId ? total + p.value : total, 0);
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