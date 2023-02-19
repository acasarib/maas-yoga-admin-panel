const PERMISSIONS = {
  CREATE_USER: "PERMISSION_CREATE_USER"
};
const FIRST_USER_PASSWORD = "123";
const FIRST_USER_EMAIL = "email@email.com";

// https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
const ALLOWED_SEQUELIZE_OPERATIONS = [
  "eq",
  "nq",
  "is",
  "not",
  "gt",
  "gte",
  "lt",
  "lte",
  "between",
  "notBetween",
  "in",
  "notIn",
  "like",
  "notLike",
  "startsWith",
  "endsWith",
  "substring",
];

const SPECIFICATION_VALUE_SEPARATOR = ":";
const SPECIFICATION_QUERY_SEPARATOR = ";";

export {
  PERMISSIONS,
  FIRST_USER_PASSWORD,
  FIRST_USER_EMAIL,
  ALLOWED_SEQUELIZE_OPERATIONS,
  SPECIFICATION_VALUE_SEPARATOR,
  SPECIFICATION_QUERY_SEPARATOR,
};
