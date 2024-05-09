import utils from "../utils/functions.js";
import * as courseService from "../services/courseService.js";
import * as paymentService from "../services/paymentService.js";

const createMonthlyProfessorPayments = async () => {
  console.log("Executing: createMonthlyProfessorPayments()");
  const now = new Date();
  now.setDate(now.getDate()+1);
  const currentMonth = now.getMonth();
  let previousMonth = currentMonth -1;
  if (previousMonth < 0) {
    previousMonth = 11;
  }
  const firstDayPreviousMonth = new Date();
  firstDayPreviousMonth.setMonth(previousMonth, 1);
  firstDayPreviousMonth.setHours(0, 0, 0, 0);
  const lastDayPreviousMonth = new Date();
  lastDayPreviousMonth.setMonth(currentMonth, 0);
  lastDayPreviousMonth.setHours(23, 59, 59);
  const from = utils.dateToYYYYMMDD(firstDayPreviousMonth);
  const to = utils.dateToYYYYMMDD(lastDayPreviousMonth);
  console.log("Calc payments for period " + from + " - " + to);
  const data = await courseService.calcProfessorsPayments(from, to);
  const amount = await courseService.addProfessorPayments(data, from, to);
  console.log(amount + " Payments added successfull");
}

const addTodayPaymentServices = async () => {
  paymentService.addTodayPaymentServices()
}

export {
  createMonthlyProfessorPayments as createMonthlyProfessorPayments,
  addTodayPaymentServices
}