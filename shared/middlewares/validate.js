const ApiError = require("../utils/ApiError");

const isValueMissing = (value) =>
  value === undefined || value === null || value === "";

const validate = (schema, source = "body") => (req, res, next) => {
  const data = req[source] || {};
  const errors = [];

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    const missing = isValueMissing(value);

    if (rules.required && missing) {
      errors.push(`${field} is required.`);
      return;
    }

    if (missing) {
      return;
    }

    if (rules.type === "string" && typeof value !== "string") {
      errors.push(`${field} must be a string.`);
      return;
    }

    if (rules.type === "number" && typeof value !== "number") {
      errors.push(`${field} must be a number.`);
      return;
    }

    if (rules.type === "boolean" && typeof value !== "boolean") {
      errors.push(`${field} must be a boolean.`);
      return;
    }

    if (rules.type === "array" && !Array.isArray(value)) {
      errors.push(`${field} must be an array.`);
      return;
    }

    if (rules.type === "date" && Number.isNaN(new Date(value).getTime())) {
      errors.push(`${field} must be a valid date.`);
      return;
    }

    if (typeof value === "string") {
      if (rules.minLength && value.trim().length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters.`);
      }

      if (rules.maxLength && value.trim().length > rules.maxLength) {
        errors.push(
          `${field} must be at most ${rules.maxLength} characters long.`
        );
      }
    }

    if (typeof value === "number") {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be >= ${rules.min}.`);
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be <= ${rules.max}.`);
      }
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(", ")}.`);
    }

    if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
      errors.push(`${field} has invalid format.`);
    }

    if (rules.custom) {
      const result = rules.custom(value, data, req);
      if (typeof result === "string" && result.length > 0) {
        errors.push(result);
      }
    }
  });

  if (errors.length > 0) {
    return next(new ApiError(400, "Validation failed.", errors));
  }

  return next();
};

module.exports = validate;
