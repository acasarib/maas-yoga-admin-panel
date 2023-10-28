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
  const data = {
    studentPayments,
    courseMemberSince,
    coursesPeriod,
  }
  return response;
};

export const pendingPayments = async (id) => {
};

export const getAll = async () => {
  return student.findAll({ include: [course] });
};

const findFirstPaymentAt = (year, month, payments) => {
  return payments.find(p => p.operativeResult.getFullYear() == year && ((p.operativeResult.getMonth()+1) == month))
}

/**
 * To know the date since a student enrolled in the courses
 * @param {Number} studentId 
 * @returns {Object} courseId as keys, member since string as value
 */
const getStudentCourseMemberSince = async (id) => {
  const sts = await student.findAll({
    attributes: ["id"],
    include: {
      model: courseStudent,
      attributes: ["createdAt", "courseId"],
    },
    where: { id } 
  });
  const result = {};
  sts[0].courseStudents.forEach(c => result[c.courseId] = c.createdAt);
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