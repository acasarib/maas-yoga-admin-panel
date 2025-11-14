import { StatusCodes } from "http-status-codes";
import { payment, course, student, user, file, professor, secretaryPayment, servicePayment, item, headquarter, clazz, category } from "../db/index.js";
import * as logService from "./logService.js";
import * as notificationService from "./notificationService.js";
import * as emailService from "./emailService.js";
import { Op, col, cast, Sequelize } from "sequelize";
import utils from "../utils/functions.js";
import { fillPaymentReceiptPDF } from "../utils/pdfUtils.js";
import ExcelJS from "exceljs";

const defaultPaymentInclude = [
  { model: professor, attributes: ["name", "lastName"]},
  user, 
  student, 
  course, 
  file, 
  secretaryPayment, 
  headquarter, 
  { model: item, include: [category] }, 
  clazz, 
  student,
  {
    model: user,
    as: "verifiedByUser",
    attributes: ["firstName", "lastName"]
  }
];
/**
 * 
 * @param {Array||Payment} paymentParam 
 * @returns {Array} created payments if @param paymentParam is Array
 * @returns {Student} created payments if @param paymentParam is Payment
 */
export const create = async (paymentParam, informerId, sendEmail = false) => {
  const isArray = Array.isArray(paymentParam);
  if (!isArray && paymentParam.isRegistrationPayment) {
    const { courseId, studentId } = paymentParam;
    if (!utils.isNumber(courseId))
      throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "invalid courseId" });
    if (!utils.isNumber(studentId))
      throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "invalid studentId" });
    const registrationPayment = await payment.findOne({ where: { isRegistrationPayment: true, studentId, courseId } })
    const alreadyRegistered = registrationPayment != null;
    if (alreadyRegistered) {
      throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "registration already added, paymentId=" + registrationPayment.id });
    }
  }
  paymentParam = isArray ? paymentParam : [paymentParam];
  for (const p of paymentParam) {
    if (p.secretaryPayment != null) {
      const { salary, sac, extraHours, extraTasks, monotributo, ...rest } = p.secretaryPayment
      let currentSecretaryPayment = await secretaryPayment.findOne({ where: { salary, sac, extraHours, extraTasks, monotributo } })
      delete p.secretaryPayment
      if (currentSecretaryPayment == undefined || currentSecretaryPayment == null) {
        currentSecretaryPayment = await secretaryPayment.create({ salary, sac, extraHours, extraTasks, monotributo })
      }
      p.secretaryPaymentId = currentSecretaryPayment.id
    }
    if ("id" in p) {
      p.oldId = p.id;
      delete p.id;
    }
    if (!("verified" in p))
      p.verified = true;
    p.userId = informerId;
  };
  const createdPayments = await payment.bulkCreate(paymentParam);
  logService.logCreatedPayments(createdPayments);
  if (sendEmail) {
    // Enviar recibo por email para cada pago creado
    try {
      for (const createdPayment of createdPayments) {
        try {
          await sendReceiptByEmail(createdPayment.id);
        } catch (error) {
          console.error(`Error enviando recibo por email para pago ${createdPayment.id}:`, error);
          // No lanzamos el error para no interrumpir el flujo principal
        }
      }
    } catch (error) {
      console.error(`Error enviando recibos por email:`, error);
    }
  }
  return (createdPayments.length === 1) ? getById(createdPayments[0].id) : createdPayments;
};

export const splitPayment = async (originalPaymentId, newPaymentParam) => {
  let originalPayment = await payment.findByPk(originalPaymentId);
  const paymentCloned = originalPayment.get({ plain: true });
  for (const key of Object.keys(newPaymentParam)) {
    paymentCloned[key] = newPaymentParam[key]
  }
  delete paymentCloned.id
  paymentCloned.paymentId = originalPaymentId
  const paymentCreated = await payment.create(paymentCloned)
  originalPayment = await payment.findByPk(originalPaymentId);
  originalPayment.value -= newPaymentParam.value;
  originalPayment.save()
  return paymentCreated;
}

export const createSecretaryPayment = (secretaryPaymentParam) => {
  return secretaryPayment.create(secretaryPaymentParam);
}

export const createServicePayment = (servicePaymentParam) => {
  return servicePayment.create(servicePaymentParam);
}

export const getServicePayments = async () => {
  return servicePayment.findAll({ include: [item] });
};

export const updatedServicePayment = async (id, data) => {
  await servicePayment.update(data, { where: { id } });
  return servicePayment.findOne({ where: { id }, include: [item]})
};

export const deleteServicePayment = async (id) => {
  await servicePayment.destroy({ where: { id } });
}

export const addTodayPaymentServices = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  console.log("CRON addTodayPaymentServices adding services with date " + formattedDate, { dayOfMonth: today.getDate(), lastTimeAdded: { [Op.not]: formattedDate } });
  const todayServicePayments = await servicePayment.findAll({
    where: {
      [Op.and]: [
        { dayOfMonth: today.getDate() },
        { [Op.or]: [
          { lastTimeAdded: { [Op.not]: formattedDate } },
          { lastTimeAdded: null }
        ]}
      ]
    }
  });
  let newPayments = []
  todayServicePayments.forEach(sp => {
    let { type, value, discount, note, itemId } = sp
    if (value > 0)
      value = value *-1
    newPayments.push({ type, value, discount, note, itemId, at: today, operativeResult: today, })
  })
  console.log("Adding " + newPayments.length + " payments");
  for (const newPayment of newPayments) {
    const dbPayment = await payment.create(newPayment);
    notificationService.notifyAll(dbPayment.id);
  }
  todayServicePayments.forEach(sp => {
    sp.lastTimeAdded = formattedDate
    sp.save()
  })
}

export const getSecretaryPayments = async () => {
  return secretaryPayment.findAll();
};

export const getLatestSecretaryPayment = async () => {
  const latestPayment = await secretaryPayment.findOne({
    order: [["createdAt", "DESC"]]
  });
  return latestPayment;
};


export const deleteById = async (id, userId) => {
  const p = await payment.findByPk(id);
  if (p) {
    if (p.fileId) {
      file.destroy({ where: { id: p.fileId } });
    }
    logService.deletePayment(userId);
    return p.destroy();
  } else {
    throw ({ statusCode: 404, message: "Payment not found"})
  }
};

export const getAllByStudentId = async (studentId) => {
  return payment.findAll({ where: { studentId }, include: [user, student, course] });
};

export const getAllByCourseId = async (courseId) => {
  return payment.findAll({ where: { courseId }, include: [user, student, course] });
};

/**
 * @deprecated
 * @param {Object} specification 
 * @returns 
 */
export const legacyGetAll = async (specification) => {
  return payment.findAll({
    where: specification.getSequelizeSpecification(),
    include: specification.getSequelizeSpecificationAssociations([{ model: professor, attributes: ["name", "lastName"]},user, student, course, item, file, {
      model: user,
      as: "verifiedByUser",
      attributes: ["firstName", "lastName"]
    }])
  });
};

export const getAll = async (page = 1, size = 10, specification) => {
  const where = specification.getSequelizeSpecification();
  const include = specification.getSequelizeSpecificationAssociations(defaultPaymentInclude);
  const findAllParams = {
    include,
    limit: size,
    offset: (page - 1) * size,
    where,
    order: [
      ["at", "DESC"]
    ]
  };
  let { count, rows } = await payment.findAndCountAll(findAllParams);
  const total = await payment.sum("value", { where });
  const incomes = await payment.sum("value", { 
    where: { ...where, value: { [Op.gte]: 0 } }
  });
  const expenses = await payment.sum("value", { 
    where: { ...where, value: { [Op.lt]: 0 } }
  });
  return {
    totalItems: count,
    totalPages: Math.ceil(count / size),
    currentPage: page,
    data: rows,
    total,
    incomes,
    expenses: expenses *-1,
  };
};

/**
 * TODO
 * @param {int} page 
 * @param {int} size 
 * @param {Object} specification 
 * @returns 
 */
export const getAllUnverified = async (page = 1, size = 10, specification, all) => {
  const spec = specification.getSequelizeSpecification();
  let where = getWhereForSearchPayment(spec, all, false);
  const include = specification.getSequelizeSpecificationAssociations(defaultPaymentInclude);
  const findAllParams = {
    include,
    limit: size,
    offset: (page - 1) * size,
    where,
    order: [
      ["at", "DESC"]
    ]
  };
  let { count, rows } = await payment.findAndCountAll(findAllParams);
  let total = 0;
  let incomes = 0;
  let expenses = 0;
  try {
    total = await payment.sum("value", { where });
    incomes = await payment.sum("value", { 
      where: { ...where, value: { [Op.gte]: 0 } }
    });
    expenses = await payment.sum("value", { 
      where: { ...where, value: { [Op.lt]: 0 } }
    });
  } catch {
    const paymentsToCount = await payment.findAll({
      attributes: ["value"],
      where,
      include: [{ model: student, attributes: [] },{ model: professor, attributes: [] }, {model: user, attributes: []}],
      raw: true
    });
    total = paymentsToCount.reduce((sum, p) => sum + p.value, 0);
    incomes = paymentsToCount.reduce((sum, p) => (p.value > 0 ? sum + p.value : sum), 0);
    expenses = paymentsToCount.reduce((sum, p) => (p.value < 0 ? sum + p.value : sum), 0);
  }
  
  return {
    totalItems: count,
    totalPages: Math.ceil(count / size),
    currentPage: page,
    data: rows,
    total,
    incomes,
    expenses: expenses *-1,
  };
};

export const getAllVerified = async (page = 1, size = 10, specification, all) => {
  const spec = specification.getSequelizeSpecification();
  let where = getWhereForSearchPayment(spec, all, true);
  const include = specification.getSequelizeSpecificationAssociations(defaultPaymentInclude);
  const findAllParams = {
    include,
    limit: size,
    offset: (page - 1) * size,
    where,
    order: [
      ["at", "DESC"]
    ]
  };
  let { count, rows } = await payment.findAndCountAll(findAllParams);
  let total = 0;
  let incomes = 0;
  let expenses = 0;
  try {
    total = await payment.sum("value", { where });
    incomes = await payment.sum("value", { 
      where: { ...where, value: { [Op.gte]: 0 } }
    });
    expenses = await payment.sum("value", { 
      where: { ...where, value: { [Op.lt]: 0 } }
    });
  } catch(e) {
    const paymentsToCount = await payment.findAll({
      attributes: ["value"],
      where,
      include: [{ model: item, attributes: [] },{ model: course, attributes: [] },{ model: student, attributes: [] },{ model: professor, attributes: [] }, {model: user, attributes: []}],
      raw: true
    });
    total = paymentsToCount.reduce((sum, p) => sum + p.value, 0);
    incomes = paymentsToCount.reduce((sum, p) => (p.value > 0 ? sum + p.value : sum), 0);
    expenses = paymentsToCount.reduce((sum, p) => (p.value < 0 ? sum + p.value : sum), 0);
  }
  
  return {
    totalItems: count,
    totalPages: Math.ceil(count / size),
    currentPage: page,
    data: rows,
    total,
    incomes,
    expenses: expenses *-1,
  };
};

export const updatePayment = async (id, data, userId, sendEmail = false) => {
  if (data.verified)
    throw ({ statusCode: StatusCodes.BAD_REQUEST, message: "Can not change verified with this endpoint" });
  await payment.update(data, { where: { id } });
  logService.logUpdate(id, userId);
  if (sendEmail) {
    try {
      await sendReceiptByEmail(id);
    } catch (error) {
      console.error(`Error enviando recibo por email para pago ${id}:`, error);
    }
  }
  return getById(id);
};

export const getById = async (id) => {
  const p = await payment.findByPk(id, { include: defaultPaymentInclude });
  if (p == null)
    throw ({ statusCode: StatusCodes.NOT_FOUND, message: "payment not found" });
  return p;
};

export const getReceipt = async (paymentId) => {
  const payment = await getById(paymentId);
  const date = utils.dateToDDMMYYYY(new Date(payment.at));
  let price = payment.value;
  if (payment.discount)
    price += (payment.discount / 100) * price;
  // Formatear precio
  price = `$${price.toLocaleString("es-AR")}`;
  // Formatear from
  const from = `${payment?.student?.name || ""} ${payment?.student?.lastName || ""}`;
  // Descripción
  const description = getReceiptDescription(payment);
  // Tipo de pago
  const paymentType = payment.type;
  // Descuento
  const discount = payment.discount;
  let discountValue = (payment.discount / 100) * payment.value;
  discountValue = `$-${discountValue.toLocaleString("es-AR")}`;
  // Total
  const total = `$${payment.value.toLocaleString("es-AR")}`;

  return fillPaymentReceiptPDF({
    date,
    from,
    description,
    paymentType,
    price,
    discount,
    total,
    discountValue,
  });
};

const getReceiptDescription = (payment) => {
  if (payment.course)
    return payment.course.title;
  if (payment.item)
    return payment.item.title;
  if (payment.clazz)
    return payment.clazz.title;
  return "";
};

export const changeVerified = async (id, verified, verifiedBy) => {
  const newData = { verified };
  if (verified)
    newData.verifiedBy = verifiedBy;
  if (verified)
    logService.logVerified(id, verifiedBy);
  else
    logService.logUpdate(id, verifiedBy);
  return payment.update(newData, { where: { id } });
};

const getWhereForSearchPayment = (spec, all, verified) => {
  if (all != undefined) {
    const iLike = "%"+all+"%";
    return {
      [Op.and]: [{ verified }, { [Op.or] : {
        [Op.or] : [
          { value: { [Op.eq]: all } },
          { type: { [Op.iLike]: iLike } },
          { note: { [Op.iLike]: iLike } },
          { type: { [Op.iLike]: iLike } },
          Sequelize.literal(`CONCAT("student"."name", ' ', "student"."last_name") ILIKE '${iLike}'`),
          Sequelize.literal(`"item"."title" ILIKE '${iLike}'`),
          Sequelize.literal(`"course"."title" ILIKE '${iLike}'`),
          Sequelize.literal(`CONCAT("user"."first_name", ' ', "user"."last_name") ILIKE '${iLike}'`),
          Sequelize.literal(`CONCAT("professor"."name", ' ', "professor"."last_name") ILIKE '${iLike}'`)
        ]
      }}]
    };
  }
  if (spec.value !== undefined || (spec[Op.or] !== undefined && spec[Op.or].value !== undefined)) {
    let obj = spec.value || spec[Op.or].value;
    let value = obj[Op.like] || obj[Op.eq];
    if (value === undefined) {
      return {
        [Op.and]: [{verified}, spec,]
      };
    }
    delete spec.value;
    if (spec[Op.or] !== undefined)
      delete spec[Op.or].value;
    return {
      [Op.and]: [{verified}, spec, 
        Sequelize.where(
          cast(col("value"), "TEXT"),
          { [Op.like]: `%${value}%` }
        )
      ]
    };
  } else {
    if (spec.note != undefined) {
      const iLike = spec.note[Op.iLike];
      spec.note = { [Op.or] : [Sequelize.literal(`"item"."title" ILIKE '${iLike}'`),
        Sequelize.literal(`"course"."title" ILIKE '${iLike}'`)]};
    }
    return {
      [Op.and]: [{verified}, spec]
    };
  }
};

/**
 * Envía el recibo de pago por email al estudiante
 * @param {number} paymentId - ID del pago
 * @param {number} informerId - ID del usuario que informó el pago
 */
const sendReceiptByEmail = async (paymentId) => {
  try {
    // Obtener el pago con toda la información necesaria
    const paymentData = await getById(paymentId);
    
    // Verificar que el estudiante tenga email
    if (!paymentData.student?.email) {
      console.log(`Estudiante ${paymentData.student?.id} no tiene email configurado`);
      return;
    }
    
    // Generar el PDF del recibo
    const pdfBuffer = await getReceipt(paymentId);
    
    const studentFirstName = utils.capitalizeString(paymentData.student.name);
    const studentLastName = utils.capitalizeString(paymentData.student.lastName);

    // Enviar el email con el PDF adjunto
    emailService.sendPaymentReceipt(
      paymentData.student.email,
      `${studentFirstName} ${studentLastName}`,
      pdfBuffer,
      paymentId
    );
    
    console.log(`Recibo enviado por email exitosamente para pago ${paymentId}`);
  } catch (error) {
    console.error(`Error enviando recibo por email para pago ${paymentId}:`, error);
    throw error;
  }
};

export const exportPaymentsByCategory = async (specification) => {
  // Fetch payments using the same specification as the frontend
  const payments = await payment.findAll({
    where: specification.getSequelizeSpecification(),
    include: specification.getSequelizeSpecificationAssociations(defaultPaymentInclude)
  });

  if (payments.length === 0) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Balance por Rubros");
    worksheet.addRow(["No hay pagos en el período seleccionado"]);
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  // Determine date range and if we need to separate by months
  const dates = payments.map(p => new Date(p.at || p.operativeResult || p.createdAt).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  // Check if period spans more than one month
  const minMonth = minDate.getMonth();
  const minYear = minDate.getFullYear();
  const maxMonth = maxDate.getMonth();
  const maxYear = maxDate.getFullYear();
  const spanMultipleMonths = (maxYear > minYear) || (maxYear === minYear && maxMonth > minMonth);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Balance por Rubros");

  if (spanMultipleMonths) {
    // Generate list of months in the period
    const months = [];
    let currentDate = new Date(minYear, minMonth, 1);
    const endDate = new Date(maxYear, maxMonth, 1);
    
    while (currentDate <= endDate) {
      months.push({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
        label: currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Group payments by category and month
    const categoryMonthGroups = {};
    
    payments.forEach(payment => {
      const value = payment.value || 0;
      const paymentDate = new Date(payment.at || payment.operativeResult || payment.createdAt);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth();
      
      // Determine category
      let categoryName = "Sin categoría";
      if (payment.item && payment.item.category) {
        categoryName = payment.item.category.title;
      } else if (payment.course) {
        categoryName = "Cursos";
      } else if (payment.clazz) {
        categoryName = "Clases";
      }

      if (!categoryMonthGroups[categoryName]) {
        categoryMonthGroups[categoryName] = {};
      }

      const monthKey = `${paymentYear}-${paymentMonth}`;
      if (!categoryMonthGroups[categoryName][monthKey]) {
        categoryMonthGroups[categoryName][monthKey] = {
          total: 0,
          count: 0
        };
      }

      categoryMonthGroups[categoryName][monthKey].total += value;
      categoryMonthGroups[categoryName][monthKey].count += 1;
    });

    // Build columns dynamically
    const columns = [{ header: "Rubro", key: "category", width: 30 }];
    months.forEach((month, index) => {
      columns.push({ 
        header: month.label.charAt(0).toUpperCase() + month.label.slice(1), 
        key: `month_${index}`, 
        width: 18 
      });
    });
    columns.push({ header: "Total", key: "total", width: 18 });
    
    worksheet.columns = columns;

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" }
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    // Add data rows
    const sortedCategories = Object.keys(categoryMonthGroups).sort();
    const monthTotals = new Array(months.length).fill(0);
    let grandTotal = 0;

    sortedCategories.forEach(categoryName => {
      const rowData = { category: categoryName };
      let categoryTotal = 0;

      months.forEach((month, index) => {
        const monthKey = `${month.year}-${month.month}`;
        const monthData = categoryMonthGroups[categoryName][monthKey];
        const monthValue = monthData ? monthData.total : 0;
        rowData[`month_${index}`] = monthValue;
        categoryTotal += monthValue;
        monthTotals[index] += monthValue;
      });

      rowData.total = categoryTotal;
      grandTotal += categoryTotal;
      
      const row = worksheet.addRow(rowData);
      row.alignment = { vertical: "middle" };
      
      // Format month columns as currency
      months.forEach((_, index) => {
        row.getCell(index + 2).numFmt = "$#,##0.00";
        row.getCell(index + 2).alignment = { horizontal: "right" };
      });
      row.getCell(months.length + 2).numFmt = "$#,##0.00";
      row.getCell(months.length + 2).alignment = { horizontal: "right" };
      row.getCell(months.length + 2).font = { bold: true };
    });

    // Add total row
    const totalRowData = { category: "TOTAL GENERAL" };
    months.forEach((_, index) => {
      totalRowData[`month_${index}`] = monthTotals[index];
    });
    totalRowData.total = grandTotal;

    const totalRow = worksheet.addRow(totalRowData);
    totalRow.font = { bold: true, size: 11 };
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" }
    };
    
    // Format total row
    months.forEach((_, index) => {
      totalRow.getCell(index + 2).numFmt = "$#,##0.00";
      totalRow.getCell(index + 2).alignment = { horizontal: "right" };
    });
    totalRow.getCell(months.length + 2).numFmt = "$#,##0.00";
    totalRow.getCell(months.length + 2).alignment = { horizontal: "right" };

  } else {
    // Single month or less - use original simple format
    const categoryGroups = {};
    let totalGeneral = 0;

    payments.forEach(payment => {
      const value = payment.value || 0;
      totalGeneral += value;

      // Determine category
      let categoryName = "Sin categoría";
      if (payment.item && payment.item.category) {
        categoryName = payment.item.category.title;
      } else if (payment.course) {
        categoryName = "Cursos";
      } else if (payment.clazz) {
        categoryName = "Clases";
      }

      if (!categoryGroups[categoryName]) {
        categoryGroups[categoryName] = {
          total: 0,
          count: 0
        };
      }

      categoryGroups[categoryName].total += value;
      categoryGroups[categoryName].count += 1;
    });

    // Define columns
    worksheet.columns = [
      { header: "Rubro", key: "category", width: 40 },
      { header: "Cantidad de Pagos", key: "count", width: 20 },
      { header: "Total Recaudado", key: "total", width: 20 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" }
    };
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    // Add data rows
    const sortedCategories = Object.keys(categoryGroups).sort();
    sortedCategories.forEach(categoryName => {
      const group = categoryGroups[categoryName];
      const row = worksheet.addRow({
        category: categoryName,
        count: group.count,
        total: group.total,
      });
      
      // Style data rows
      row.alignment = { vertical: "middle" };
    });

    // Add total row
    const totalRow = worksheet.addRow({
      category: "TOTAL GENERAL",
      count: payments.length,
      total: totalGeneral,
    });
    
    totalRow.font = { bold: true, size: 12 };
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" }
    };

    // Format total column as currency
    worksheet.getColumn("total").numFmt = "$#,##0.00";
    worksheet.getColumn("total").alignment = { horizontal: "right" };
    worksheet.getColumn("count").alignment = { horizontal: "center" };
  }

  // Add borders to all cells (applies to both formats)
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};