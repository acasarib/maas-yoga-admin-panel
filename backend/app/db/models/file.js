import { Sequelize, DataTypes } from "sequelize";

const file = (sequelize) => {
  const file = sequelize.define("file", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type: { type: Sequelize.STRING, allowNull: false },
    name: { type: Sequelize.STRING, allowNull: false },
    blob: { type: DataTypes.BLOB("long"), allowNull: false },
  }, {
    defaultScope: {
      attributes: {
        exclude: ["blob"]
      }
    },
    scopes: {
      withBlob: {
        attributes: {
          include: ["blob"]
        }
      }
    }
  });
  file.associate = function (models) {
    // associations can be defined here
  };
  return file;
};

export default file;