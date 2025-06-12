import { ALLOWED_SEQUELIZE_OPERATIONS, SPECIFICATION_VALUE_SEPARATOR, SPECIFICATION_QUERY_SEPARATOR } from "../utils/constants.js";
import { Sequelize, Op, literal } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "../db/index.js";
import utils from "../utils/functions.js";

class Specification {

  constructor(rawQuerySpecification = "", model, isOrOperation = false) {
    this.isOrOperation = isOrOperation;
    const modelAttributes = model.getAttributes();
    const rawModelAttributes = Object.keys(modelAttributes);
    const isValidAttribute = atributte => rawModelAttributes.includes(atributte);
    const isValidOperation = operation => ALLOWED_SEQUELIZE_OPERATIONS.includes(operation);
    const emptyString = string => string.length > 0;
    const splitByQuerySeparator = rawQuerySpecification.split(SPECIFICATION_QUERY_SEPARATOR)
      .filter(emptyString);
    this.queryParts = [];
    const invalidAttributes = [];
    const invalidOperations = [];
    this.specificationAssociations = [];
    splitByQuerySeparator.forEach(part => {
      let error = false;
      const splitBySpaces = part.split(" ");
      let [attribute, operation, value] = splitBySpaces;
      if (splitBySpaces.length > 3) {
        value = part.replace(attribute + " " + operation, "");
        value = value.slice(1);
      }
      const isAssociationAttribute = attribute.includes(".");
      if (isAssociationAttribute) {
        const [associationName, associationAttribute] = attribute.split(".");
        const existsAssociation = associationName in model.associations;
        if (existsAssociation) {
          const associationSpecification = { model: sequelize.models[associationName], where: {} };
          if (operation == "iLike")
            associationSpecification.where[associationAttribute] = { [Op.iLike]: value };
          else
            associationSpecification.where[associationAttribute] = value;
          this.specificationAssociations.push(associationSpecification);
        } else {
          error = true;
          invalidAttributes.push(attribute);
        }
      } else if (!isValidAttribute(attribute)) {
        error = true;
        invalidAttributes.push(attribute);
      }
      if (!isValidOperation(operation)) {
        error = true;
        invalidOperations.push(operation);
      }
      if (!error && !isAssociationAttribute) {
        const valueType = modelAttributes[attribute]?.type;
        if (!(valueType instanceof Sequelize.STRING)) {
          let valueSplitedBySeparator = value.split(SPECIFICATION_VALUE_SEPARATOR);
          if (valueType instanceof Sequelize.DataTypes.INTEGER || valueType instanceof Sequelize.DataTypes.FLOAT) {
            if (!value.includes("%")) {
              const isValidValue = utils.isNumber(value);
              value = isValidValue ? Number(value) : null;
            }
          } else {
            if (valueType instanceof Sequelize.DataTypes.DATE)
              valueSplitedBySeparator = valueSplitedBySeparator.map(Number);
            value = valueSplitedBySeparator.length > 1 ? valueSplitedBySeparator : valueSplitedBySeparator[0];
          }
        }
        if (value != null || operation == "ne")
          this.queryParts.push({ attribute, operation, value });
      }
    });
    if (invalidAttributes.length > 0 || invalidOperations.length > 0) {
      throw ({ statusCode: StatusCodes.BAD_REQUEST, message: { invalidAttributes, invalidOperations } });
    }
  }

  getSequelizeSpecification() {
    const spec = {};
    this.queryParts.forEach(queryPart => {
      spec[queryPart.attribute] = { [Op[queryPart.operation]]: queryPart.value };
    });
    return this.isOrOperation ? { [Op.or]: spec }: spec;
  }

  getSequelizeSpecificationAssociations(extraAssociations) {
    return [...extraAssociations, ...this.specificationAssociations];
  }

}

export default Specification;