import { Op } from "sequelize";
import { course, professor, payment, professorCourse, user } from "../db/index.js";
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

export const getPendingPayments = async () => {
  // Obtener todos los profesores
  const professors = await professor.findAll({
    attributes: ["id", "name", "lastName"],
    include: [
      {
        model: course,
        attributes: ["id", "title"],
      },
      {
        model: payment,
        attributes: [
          "id",
          "value",
          "courseId",
          "verified",
          "periodFrom",
          "periodTo",
          "operativeResult",
          "professorId"
        ],
        include: [
          {
            model: course,
            attributes: ["id", "title"]
          },
          {
            model: user,
            as: "verifiedByUser",
            attributes: ["id", "firstName", "lastName"]
          }
        ]
      }
    ]
  });

  const result = [];

  for (const prof of professors) {
    // Cargar los periods de cada curso
    for (const courseObj of prof.courses) {
      courseObj.dataValues.professorCourse = await professorCourse.findAll({ where: { courseId: courseObj.id, professorId: prof.id } });
    }
    const { owedPeriods, notVerifiedPeriods } = await getProfessorPendingPayments(prof);
    if ((owedPeriods && owedPeriods.length > 0) || (notVerifiedPeriods && notVerifiedPeriods.length > 0)) {
      result.push({
        id: prof.id,
        name: prof.name,
        lastName: prof.lastName,
        owedPeriods,
        notVerifiedPeriods
      });
    }
  }
  return result;
};

export const getById = async (id) => {
  const p = await professor.findByPk(id, { include: [course, {model: payment, include: [course, {
    model: user,
    as: "verifiedByUser",
    attributes: ["firstName", "lastName"]
  }]}] });
  for (const course of p.courses) {
    course.dataValues.professorCourse = await professorCourse.findAll({ where: { courseId: course.id, professorId: p.id } });
  }
  const { owedPeriods, notVerifiedPeriods } = await getProfessorPendingPayments(p);
  p.dataValues.owedPeriods = owedPeriods;
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

const getProfessorPendingPayments = async (prof) => {
  const owedPeriods = [];
  const notVerifiedPeriods = [];
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth()+1;
  try {
    prof.dataValues.courses.forEach(course => {
      course.dataValues.professorCourse.forEach(period => {
        const seriesPeriod = utils.series(period.startAt, period.endAt);
        seriesPeriod.forEach(dateMonth => {
          const year = dateMonth.getFullYear();
          const month = dateMonth.getMonth() +1;
          // Busco si existe un pago para el periodo
          const payment = getPaymentAt(prof, month, year, course.id);
          if (payment) {
            // Si existe pero no esta verificado
            if (!payment.verified) {
              notVerifiedPeriods.push({year,month, payment, course});
            }
          } else {
            // Si no hay pago para el periodo
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
  return { owedPeriods: owedPeriodsFiltered, notVerifiedPeriods };
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