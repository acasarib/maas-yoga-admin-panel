import { Sequelize } from "sequelize";

const user = (sequelize) => {
  const user = sequelize.define("user", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: Sequelize.STRING,
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    password: Sequelize.STRING,
    permissionCreateUser: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    permissionGoogleDrive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  }, {
    defaultScope: {
      attributes: {
        exclude: ["password"]
      }
    },
    scopes: {
      withPassword: {
        attributes: {
          include: ["password"]
        }
      }
    }
  });
  user.associate = function (models) {
    // associations can be defined here
  };
  return user;
};

export default user;