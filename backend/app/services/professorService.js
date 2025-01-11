import { Op } from "sequelize";
import { course, professor, payment, professorCourse } from "../db/index.js";
import utils from "../utils/functions.js";

export const create = async (professorParam) => {
  const createdProfessor = await professor.create(professorParam);
  return getById(createdProfessor.id);
};

export const deleteById = async (id) => {
  professor.destroy({ where: { id } });
};

export const editById = async (professorParam, id) => {
  await professor.update(professorParam, { where: { id } });
  return getById(id);
};

export const getById = async (id) => {
  const p = await professor.findByPk(id, { include: [course, payment] });
  for (const course of p.courses) {
    course.dataValues.professorCourse = await professorCourse.findAll({ where: { courseId: course.id, professorId: p.id } });
  }
  const owedPeriods = [];
  const notVerifiedPeriods = [];
  try {
    p.dataValues.courses.forEach(course => {
      course.dataValues.professorCourse.forEach(period => {
        const seriesPeriod = utils.series(period.startAt, period.endAt);
        seriesPeriod.forEach(dateMonth => {
          const year = dateMonth.getFullYear();
          const month = dateMonth.getMonth() +1;
          const payment = getPaymentAt(p, month, year, course.id);
          if (payment) {
            if (!payment.verified) {
              notVerifiedPeriods.push({year,month, payment, course});
            }
          } else {
            const date = new Date();
            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth()+1;
            if (year < currentYear) {
              owedPeriods.push({year,month, course});
            } else if (year === currentYear) {
              if (month < currentMonth) {
                owedPeriods.push({year,month, course});
              }
            }
          }
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
  const coursesIdsDictedByProfessor = [...new Set(owedPeriods.map(p => p.course.id))];
  const coursesPayments = await payment.findAll({ where: { courseId: { [Op.in]: coursesIdsDictedByProfessor }, verified: true }});
  const owedPeriodsFiltered = [];
  // Filtra los periodos que no tienen pagos de estudiantes
  for (const period of owedPeriods) {
    const { year, month, course } = period;
    const hasMatchingPayment = coursesPayments.some(payment => {
      const paymentDate = new Date(payment.operativeResult);
      const paymentMonth = paymentDate.getMonth() + 1;
      const paymentYear = paymentDate.getFullYear();

      return (
        paymentYear === year &&
        paymentMonth === month &&
        payment.courseId === course.id
      );
    });
    if (hasMatchingPayment) {
      owedPeriodsFiltered.push(period);
    }
  }
  p.dataValues.owedPeriods = owedPeriodsFiltered;
  p.dataValues.notVerifiedPeriods = notVerifiedPeriods;
  // Son pagos que se cargaron de ingresos y egresos
  p.dataValues.professorPayments = p.payments.filter(pr => pr.periodFrom == null && pr.periodTo == null && pr.professorId == p.id);
  p.dataValues.balance = p.dataValues.professorPayments.reduce((acc, pay) => acc + pay.value, 0);
  return p;
};

export const getAll = async (specification) => {
  return await professor.findAll({
    where: specification.getSequelizeSpecification(),
    /*include: [clazzDayDetail],*/
  });
};

const getPaymentAt = (p, month, year, courseId) => {
  return p.payments.find(payment => {
    if (!("periodFrom" in payment && "periodTo" in payment)) {
      return false;
    }
    if (courseId != payment.courseId) {
      return false;
    }
    const paymentFrom = new Date(payment.periodFrom + "T00:00:00");
    const paymentTo = new Date(payment.periodTo + "T23:59:59");
    const paymentFromMonth = paymentFrom.getMonth()+1;
    const paymentToMonth = paymentFrom.getMonth()+1;
    const paymentToYear = paymentTo.getFullYear();
    const paymentFromYear = paymentTo.getFullYear();
    const sameMonth = month == paymentFromMonth && month == paymentToMonth;
    const sameYear = year == paymentFromYear && year == paymentToYear;
    return sameMonth && sameYear;
  });
};