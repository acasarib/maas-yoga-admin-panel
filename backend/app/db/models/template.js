import { Sequelize } from "sequelize";

const template = (sequelize) => {
  const template = sequelize.define("template", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
  },{
    defaultScope: {
      attributes: {
        exclude: ["content"]
      }
    },
    scopes: {
      withContent: {
        attributes: {
          include: ["content"]
        }
      }
    }
  });
  template.associate = function (models) {
    // associations can be defined here
  };
  return template;
};

export default template;