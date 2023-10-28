import { Op } from "sequelize";
import { student, course, courseTask, payment, sequelize, courseStudent } from "../db/index.js";
import { STUDENT_MONTHS_CONDITIONS } from "../utils/constants.js";

/**
 * 
 * @param {Array||Student} studentParam 
 * @returns {Array} created students if @param studentParam is Array
 * @returns {Student} created student if @param studentParam is Student
 */
export const create = async (studentParam) => {
  const isArray = Array.isArray(studentParam);
  const createdStudents = await student.bulkCreate(isArray ? studentParam : [studentParam]);
  return (createdStudents.length === 1) ? createdStudents[0] : createdStudents;
};

export const deleteById = async (id) => {
  return student.destroy({ where: { id } });
};

export const editById = async (studentParam, id) => {
  await student.update(studentParam, { where: { id } });
  return getById(id);
};

export const getById = async (id) => {
  return student.findByPk(id, { include: [course, courseTask, payment] });
};

export const pendingPaymentsByStudentId = async (id) => {
  const response = {
    courses: {}
  };
  let coursesPeriod = getCoursesPeriodByStudentId(id);
  let courseMemberSince = getStudentCourseMemberSince(id);
  let studentPayments = payment.findAll({ where: { studentId: id } });
  studentPayments = await studentPayments;
  coursesPeriod = await coursesPeriod;
  courseMemberSince = await courseMemberSince;
  coursesPeriod.forEach(coursePeriod => {
    const courseId = coursePeriod["course_id"]
    const since = courseMemberSince[courseId];
    if (!(courseId in response.courses)) {
      response.courses[courseId] = {
        memberSince: since,
        periods: {}
      }
    }
    const sinceYear = since.getFullYear();
    const sinceMonth = since.getMonth() +1;
    const year = coursePeriod.year;
    const month = coursePeriod.month;
    const isMemberInPeriod = year > sinceYear || (sinceYear == year && month >= sinceMonth);
    if (!(year in response.courses[courseId].periods))
      response.courses[courseId].periods[year] = {};
    let status;
    if (isMemberInPeriod) {
      const periodPayment = findFirstPaymentAt(year, month, studentPayments);
      if (periodPayment) {
        status = {
          condition: STUDENT_MONTHS_CONDITIONS.PAID,
          payment: periodPayment,
        };
      } else {
        status = {
          condition: STUDENT_MONTHS_CONDITIONS.NOT_PAID,
          payment: periodPayment,
        };
      }
    } else {
      status = {
        condition: STUDENT_MONTHS_CONDITIONS.NOT_TAKEN,
      };
    }
    response.courses[courseId].periods[year][month] = status;
  });
  return response;
};

export const pendingPayments = async () => {
  const response = {
    students: {}
  };
  let coursesPeriod = getCoursesPeriodByStudentId();
  let courseMemberSince = getStudentCourseMemberSince();
  coursesPeriod = await coursesPeriod;
  courseMemberSince = await courseMemberSince;
  let studentIds = Object.keys(courseMemberSince.students);
  let studentPayments = await payment.findAll({ where: { studentId: { [Op.in]: studentIds } } });
  coursesPeriod.forEach(coursePeriod => {
    studentIds.forEach(studentId => {
      const courseId = coursePeriod["course_id"]
      const since = courseMemberSince.students[studentId].courses[courseId];
      if (since == undefined)
        return;
      if (!(studentId in response.students)) {
        response.students[studentId] = {
          courses: {}
        }
      }
      if (!(courseId in response.students[studentId].courses)) {
        response.students[studentId].courses[courseId] = {
          memberSince: since,
          periods: {}
        }
      }
      const sinceYear = since.getFullYear();
      const sinceMonth = since.getMonth() +1;
      const year = coursePeriod.year;
      const month = coursePeriod.month;
      const isMemberInPeriod = year > sinceYear || (sinceYear == year && month >= sinceMonth);
      if (!(year in response.students[studentId].courses[courseId].periods))
        response.students[studentId].courses[courseId].periods[year] = {};
      let status;
      if (isMemberInPeriod) {
        const periodPayment = findFirstPaymentAt(year, month, studentPayments, studentId);
        if (periodPayment) {
          status = {
            condition: STUDENT_MONTHS_CONDITIONS.PAID,
            payment: periodPayment,
          };
        } else {
          status = {
            condition: STUDENT_MONTHS_CONDITIONS.NOT_PAID,
            payment: periodPayment,
          };
        }
      } else {
        status = {
          condition: STUDENT_MONTHS_CONDITIONS.NOT_TAKEN,
        };
      }
      response.students[studentId].courses[courseId].periods[year][month] = status;
    });
  });

  return response;
};

export const getAll = async () => {
  return student.findAll({ include: [course] });
};

const findFirstPaymentAt = (year, month, payments, studentId = null) => {
  const matchYearAndMonth = (p) => p.operativeResult.getFullYear() == year && ((p.operativeResult.getMonth()+1) == month);
  const byStudentId = studentId != null;
  if (byStudentId)
    return payments.find(p => matchYearAndMonth(p) && p.studentId == studentId);
  else
    return payments.find(matchYearAndMonth);
}

/**
 * To know the date since a student enrolled in the courses
 * @param {Number} studentId 
 * @returns {Object} courseId as keys, member since as value
 * @returns {Object} studentId as keys, value courses with member since value
 */
const getStudentCourseMemberSince = async (id = null) => {
  const options = {
    attributes: ["id"],
    include: {
      model: courseStudent,
      attributes: ["createdAt", "courseId"],
    },
  }
  if (id != null) 
    options.where = { id };
  const sts = await student.findAll(options);
  const result = {};
  if (id != null) {
    sts[0].courseStudents.forEach(c => result[c.courseId] = c.createdAt);
  } else {
    result.students = {}
    sts.forEach(st => {
      result.students[st.id] = { courses: {} }
      st.courseStudents.forEach(c => result.students[st.id].courses[c.courseId] = c.createdAt);
    })
  }
  return result;
}

const getCoursesPeriodByStudentId = async (studentId = null) => {
  let query = `
    SELECT DISTINCT
      c.id as course_id,
      extract('year' from generate_series(
        DATE_TRUNC('month', start_at),
        DATE_TRUNC('month', end_at),
        INTERVAL '1 month'
      )) as year,
      extract('month' from generate_series(
        DATE_TRUNC('month', start_at),
        DATE_TRUNC('month', end_at),
        INTERVAL '1 month'
      )) as month
    FROM course c JOIN course_student cs on c.id = cs.course_id
    `;
    if (studentId != null) {
      query += " WHERE student_id = :studentId;"
    } else {
      query += ";";
    }
  const result = await sequelize.query(query, {
    replacements: { studentId },
    type: sequelize.QueryTypes.SELECT,
  });
  return result;
}