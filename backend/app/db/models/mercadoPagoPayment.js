import { Sequelize } from "sequelize";

const mercadoPagoPayment = (sequelize) => {
  const mercadoPagoPayment = sequelize.define("mercado_pago_payment", {
    id: {
      type: Sequelize.STRING, // ID de MercadoPago (string)
      primaryKey: true,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    completed: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    studentId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    courseId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    month: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    value: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    discount: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    paymentId: {
      type: Sequelize.INTEGER,
      allowNull: true, // Null hasta que se cree el payment en la base de datos
    },
    preferenceId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    preferenceLink: {
      type: Sequelize.STRING,
      allowNull: true, // Link de la preferencia de MercadoPago
    },
    externalReference: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    // Campos adicionales de MercadoPago para referencia
    transactionAmount: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    paymentMethodId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    paymentTypeId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    statusDetail: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // Metadata adicional
    studentName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    courseTitle: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    monthName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true, // Agrega createdAt y updatedAt
  });

  mercadoPagoPayment.associate = function (models) {
    // Relaciones
    mercadoPagoPayment.belongsTo(models.student, { 
      foreignKey: "studentId",
      as: "student"
    });
    mercadoPagoPayment.belongsTo(models.course, { 
      foreignKey: "courseId",
      as: "course"
    });
    mercadoPagoPayment.belongsTo(models.payment, { 
      foreignKey: "paymentId",
      as: "payment"
    });
  };

  return mercadoPagoPayment;
};

export default mercadoPagoPayment;
