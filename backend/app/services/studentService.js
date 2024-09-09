import { Op } from "sequelize";
import { student, course, courseTask, payment, sequelize, courseStudent, courseStudentSuspend, studentCourseTask } from "../db/index.js";
import { STUDENT_MONTHS_CONDITIONS, STUDENT_STATUS } from "../utils/constants.js";
import utils from "../utils/functions.js";

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
  const st = await student.findByPk(id, { include: [course, courseStudent, courseTask, payment] });
  for (const c of st.dataValues.courses) {
    if (c.needsRegistration) {
      const registrationPayment = await getRegistrationPaymentId(id, c.id);
      const registrationPaymentId = registrationPayment?.dataValues?.id
      c.dataValues.registrationPaymentId = registrationPaymentId
    }
  }
  return st;
};

export const pendingPaymentsByStudentId = async (id) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const previousMonth = now.getMonth();
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
    const isPendingPeriod = currentYear < year || (currentYear == year && month >= previousMonth);
    if (!(year in response.courses[courseId].periods))
      response.courses[courseId].periods[year] = {};
    let status;
    if (isMemberInPeriod) {
      const periodPayment = findFirstPaymentAt(year, month, courseId, studentPayments);
      if (periodPayment) {
        status = {
          condition: STUDENT_MONTHS_CONDITIONS.PAID,
          payment: periodPayment,
        };
      } else if (isPendingPeriod) {
        status = {
          condition: STUDENT_MONTHS_CONDITIONS.PENDING,
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
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const response = {
    students: {}
  };
  let coursesPeriod = getCoursesPeriodByStudentId();
  let courseMemberSince = getStudentCourseMemberSince();
  coursesPeriod = await coursesPeriod;
  courseMemberSince = await courseMemberSince;
  let studentIds = Object.keys(courseMemberSince.students);
  let studentPayments = await payment.findAll({ where: { studentId: { [Op.in]: studentIds }, isRegistrationPayment: false } });
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
      const sinceMonth = since.getMonth() + 1;
      const year = coursePeriod.year;
      const month = coursePeriod.month;
      const isMemberInPeriod = year > sinceYear || (sinceYear == year && month >= sinceMonth);
      const isPendingPeriod = currentYear < year || (currentYear == year && month > currentMonth);
      if (!(year in response.students[studentId].courses[courseId].periods))
        response.students[studentId].courses[courseId].periods[year] = {};
      let status;
      if (isMemberInPeriod) {
        const periodPayment = findFirstPaymentAt(year, month, courseId, studentPayments, studentId);
        if (periodPayment) {
          status = {
            condition: STUDENT_MONTHS_CONDITIONS.PAID,
            payment: periodPayment,
          };
        } else if (isPendingPeriod) {
          status = {
            condition: STUDENT_MONTHS_CONDITIONS.PENDING,
          }
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

  const circularCourses = await course.findAll({ 
    attributes: ["id"],
    where: { isCircular: true },
    include: {
      model: courseStudent,
      attributes: ["createdAt", "courseId", "studentId"],
  }})
  studentIds = []
  circularCourses.forEach(circularCourse => {
    circularCourse.courseStudents.forEach(cs => {
      studentIds.push(cs.studentId)
    })
  })
  studentPayments = await payment.findAll({ where: { studentId: { [Op.in]: studentIds }, isRegistrationPayment: false } });

  circularCourses.forEach(circularCourse => {
    circularCourse.courseStudents.forEach(cs => {
      if (!(cs.studentId in response.students)) {
        response.students[cs.studentId] = { courses: {} }
      }
      const circularPayment = studentPayments.find(p => p.studentId == cs.studentId && p.courseId == circularCourse.id);
      response.students[cs.studentId].courses[circularCourse.id] = {
        memberSince: cs.createdAt,
        circularPayment: circularPayment == undefined ? null : circularPayment
      }
    })
  })

  return onlyNotPaidStudents(response);
};

export const getAll = async () => {
  return student.findAll({ include: [course] });
};

//TODO: optimizar estas consultas
export const getStudentsByCourse = async (courseId) => {
  const c = await course.findOne({ include: [{
    model: student,
    include: [courseTask],
    attributes: ["name", "lastName", "document", "email", "phoneNumber", "id"]
  }], where: { id: courseId } })
  let studentsIds = c.students.map(c => c.id)
  const payments = await payment.findAll({ where: { courseId, studentId: {
    [Op.in]: studentsIds
  } } })
  if (c.isCircular) {
    const getCircularPayment = (studentId) => payments.find(p => !p.isRegistrationPayment && p.studentId == studentId);
    for (const s of c.dataValues.students) {
      const st = s.dataValues
      if (c.needsRegistration) {
        st.registrationPayment = getRegistrationPayment(st.id)
        st.registrationPaid = st.registrationPayment != undefined;
      }
      st.suspendedPeriods = await courseStudentSuspend.findAll({ where: { studentId: st.id, courseId } });
      st.circularPayment = getCircularPayment(st.id)
      st.pendingPayments = { circular: !st.circularPayment }
    }
    return c.dataValues.students;
  }
  let courseStartAt = c.startAt
  courseStartAt.setHours(0);
  courseStartAt.setMinutes(0);
  courseStartAt.setSeconds(0);
  courseStartAt.setMilliseconds(0);
  let courseEndAt = c.endAt
  courseEndAt.setHours(23);
  courseEndAt.setMinutes(59);
  courseEndAt.setSeconds(59);
  courseEndAt.setMilliseconds(999);
  const dateSeries = utils.getMonthlyDateSeries(courseStartAt, courseEndAt)
  const getRegistrationPayment = (studentId) => payments.find(p => p.isRegistrationPayment && p.studentId == studentId);
  const getPaymentByYearAndMonthAndStudentId = (year, month, studentId) => {
    return payments.find(p => {
      if (p.isRegistrationPayment) {
        return false
      }
      if (p.studentId == studentId) {
        const date = p.operativeResult
        return year == date.getFullYear() && (date.getMonth()+1) == month
      } else {
        return false
      }
    })
  }
  const now = new Date()
  const currentMonth = now.getMonth()+1
  const currentYear = now.getFullYear()
  for (const s of c.dataValues.students) {
    const st = s.dataValues
    if (c.needsRegistration) {
      st.registrationPayment = getRegistrationPayment(st.id)
      st.registrationPaid = st.registrationPayment != undefined;
    }
    st.pendingPayments = {}
    st.suspendedPeriods = await courseStudentSuspend.findAll({ where: { studentId: st.id, courseId } });
    st.suspendedPeriods = st.suspendedPeriods.map(sp => ({ suspendedAt: sp.suspendedAt, suspendedEndAt: sp.suspendedEndAt }))
    st.suspendedPeriodsParsed = await getSuspendedPeriods(st.suspendedPeriods)
    st.status = getStudentStatus(st.suspendedPeriodsParsed);
    const isThisMonthSuspended = st.suspendedPeriodsParsed.includes(currentYear+"-"+(currentMonth < 10 ? "0"+currentMonth : currentMonth))
    st.currentMonth = isThisMonthSuspended ? STUDENT_MONTHS_CONDITIONS.SUSPEND : STUDENT_MONTHS_CONDITIONS.NOT_PAID
    dateSeries.forEach(date => {
      const year = date.getFullYear()
      const month = date.getMonth()+1
      if (!(year in st.pendingPayments)) {
        st.pendingPayments[year] = {}
      }
      const paymentByYearAndMonth = getPaymentByYearAndMonthAndStudentId(year, month, st.id)
      if (paymentByYearAndMonth) {
        st.pendingPayments[year][month] = { condition: STUDENT_MONTHS_CONDITIONS.PAID, payment: {at: paymentByYearAndMonth.at, value: paymentByYearAndMonth.value } }
        if (year == currentYear && month == currentMonth) {
          st.currentMonth = STUDENT_MONTHS_CONDITIONS.PAID
        }
      } else {
        const studentMemberSince = st.courseStudent.createdAt;
        const monthSince = studentMemberSince.getMonth() +1
        const yearSince = studentMemberSince.getFullYear()
        if (yearSince < year) {
          st.pendingPayments[year][month] = { condition: STUDENT_MONTHS_CONDITIONS.NOT_PAID }
        } else if (yearSince == year) {
          if (monthSince < month) {
            st.pendingPayments[year][month] = { condition: STUDENT_MONTHS_CONDITIONS.NOT_PAID }
          } else {
            st.pendingPayments[year][month] = { condition: STUDENT_MONTHS_CONDITIONS.NOT_TAKEN }
          }
        } else {
          st.pendingPayments[year][month] = { condition: STUDENT_MONTHS_CONDITIONS.NOT_TAKEN }
        }
      }
      if (st.currentMonth == STUDENT_MONTHS_CONDITIONS.NOT_PAID && !utils.isDateBetween(new Date(), courseStartAt, courseEndAt)) {
        st.currentMonth = STUDENT_MONTHS_CONDITIONS.NOT_TAKEN;
      }
    })
    calcSuspendedPaymentsBySuspendedPeriods(st.suspendedPeriodsParsed, st.pendingPayments)
  }
  return c.dataValues.students
};

export const suspendStudentFromCourse = async (studentId, courseId, from, to = null) => {
  const whereStudentCourseFrom = { where: { studentId, courseId, suspendedAt: from } }
  const currentSuspendPeriod = await courseStudentSuspend.findOne(whereStudentCourseFrom)
  const data = { courseId, studentId, suspendedAt: from, suspendedEndAt: to }
  if (currentSuspendPeriod) {
    courseStudentSuspend.update(data, whereStudentCourseFrom);
  } else {
    courseStudentSuspend.create(data);
  }
}

export const deleteSuspendStudentFromCourse = async (studentId, courseId, from, to = null) => {
  const data = { courseId, studentId, suspendedAt: from, suspendedEndAt: to }
  const suspendPeriod = await courseStudentSuspend.findOne({ where: data });
  suspendPeriod.destroy()
}

const calcSuspendedPaymentsBySuspendedPeriods = (suspendedPeriods, pendingPayments) => {
  suspendedPeriods.forEach(sp => {
    let [yearSuspended, monthSuspended] = sp.split("-")
    monthSuspended = parseInt(monthSuspended)
    if (yearSuspended in pendingPayments && monthSuspended in pendingPayments[yearSuspended]) {
      pendingPayments[yearSuspended][monthSuspended] = {condition: STUDENT_MONTHS_CONDITIONS.SUSPEND}
    }
  })
}

const onlyNotPaidStudents = (data) => {
  const studentIds = Object.keys(data.students);
  for (const studentId of studentIds) {
    const studentCoursesIds = Object.keys(data.students[studentId].courses);
    for (const courseId of studentCoursesIds) {
      if ("circularPayment" in data.students[studentId].courses[courseId]) {
        if (data.students[studentId].courses[courseId].circularPayment != null) {
          delete data.students[studentId].courses[courseId]
        }
        continue
      }
      const courseYears = Object.keys(data.students[studentId].courses[courseId].periods);
      let hasAnyNotPaidPaymentCourse = false;
      for (const year of courseYears) {
        const months = Object.keys(data.students[studentId].courses[courseId].periods[year]);
        for (const month of months) {
          const periodCondition = data.students[studentId].courses[courseId].periods[year][month].condition;
          if (periodCondition === STUDENT_MONTHS_CONDITIONS.NOT_PAID) {
            hasAnyNotPaidPaymentCourse = true;
            break;
          }
        }
      }
      if (!hasAnyNotPaidPaymentCourse) {
        delete data.students[studentId].courses[courseId]
      }
    }
    if (Object.keys(data.students[studentId].courses).length == 0) {
      delete data.students[studentId];
    }
  }
  return data;
}

const getStudentStatus = (suspendedPeriods) => {
  const now = new Date()
  let currentMonth = now.getMonth()+1
  const currentYear = now.getFullYear()
  currentMonth = currentMonth < 10 ? "0" + currentMonth : currentMonth
  const isThisMonthSuspended = suspendedPeriods.includes(currentYear+"-"+currentMonth)
  return isThisMonthSuspended ? STUDENT_STATUS.SUSPEND : STUDENT_STATUS.ACTIVE
}

const getSuspendedPeriods = async (suspendPeriods) => {
  const monthsSuspended = []
  for (const sp of suspendPeriods) {
    const from = sp.suspendedAt;
    let to = sp.suspendedEndAt;
    if (to === null) {
      const now = new Date()
      to = now.getFullYear()+"-"+now.getMonth()+1
    }
    let [year, month] = from.split("-")
    let [targetYear, targetMonth] = to.split("-")
    month = parseInt(month)
    if (targetYear < year)
      return;
    while (year <= targetYear) {
      while ((year < targetYear && month <= 12) || (month <= targetMonth)) {
        monthsSuspended.push(year+"-"+(month < 10 ? "0" + month : month))
        month++
      }
      year++
      month = 1
    }
  }
  return monthsSuspended;
}

const findFirstPaymentAt = (year, month, courseId, payments, studentId = null) => {
  const matchYearAndMonth = (p) => p.courseId == courseId && p.operativeResult.getFullYear() == year && ((p.operativeResult.getMonth() + 1) == month);
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

const getRegistrationPaymentId = async (studentId, courseId) => {
  return payment.findOne({ where: { isRegistrationPayment: true, studentId, courseId } })
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