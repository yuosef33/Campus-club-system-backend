const validate = require("../../../../shared/middlewares/validate");
const {
  isValidEmail,
  isStrongPassword,
  isValidObjectId,
} = require("../../../../shared/validation/rules");
const { ROLES, USER_STATUS } = require("../../../../shared/constants/roles");
const { matchBueEmail, isValidBueYear } = require("../utils/email.util");

const validateBueEmail = (email) => {
  const match = matchBueEmail(email);
  if (!match) return "Invalid BUE email format.";

  if (!isValidBueYear(match[2])) return "Invalid ID";

  return null;
};

const validateRegister = validate({
  displayName: { required: true, type: "string", minLength: 2, maxLength: 60 },
  email: {
    required: true,
    type: "string",
    custom: (value) => (validateBueEmail(value)),
  },
  password: {
    required: true,
    type: "string",
    custom: (value) =>
      isStrongPassword(value)
        ? null
        : "password must be at least 8 chars with upper, lower, number and symbol.",
  },
});

const validateLogin = validate({
  email: {
    required: true,
    type: "string",
    custom: (value) => (isValidEmail(value) ? null : "email must be valid."),
  },
  password: { required: true, type: "string", minLength: 1 },
});

const validateEmailVerificationRequest = validate({
  email: {
    required: true,
    type: "string",
    custom: (value) => (isValidEmail(value) ? null : "email must be valid."),
  },
});

const validateForgotPassword = validate({
  email: {
    required: true,
    type: "string",
    custom: (value) => (isValidEmail(value) ? null : "email must be valid."),
  },
});

const validateResetPassword = validate({
  token: { required: true, type: "string", minLength: 20 },
  newPassword: {
    required: true,
    type: "string",
    custom: (value) =>
      isStrongPassword(value)
        ? null
        : "newPassword must be at least 8 chars with upper, lower, number and symbol.",
  },
});

const validateEmailVerificationConfirm = validate({
  token: { required: true, type: "string", minLength: 20 },
});

const validateEmailVerificationConfirmQuery = validate(
  {
    token: { required: true, type: "string", minLength: 20 },
  },
  "query"
);

const validateProfileUpdate = validate({
  displayName: { required: true, type: "string", minLength: 2, maxLength: 60 },
});

const validatePasswordUpdate = validate({
  currentPassword: { required: true, type: "string", minLength: 8 },
  newPassword: {
    required: true,
    type: "string",
    custom: (value) =>
      isStrongPassword(value)
        ? null
        : "newPassword must be at least 8 chars with upper, lower, number and symbol.",
  },
});

const validateAdminUserFilters = validate(
  {
    status: { required: false, type: "string", enum: Object.values(USER_STATUS) },
    role: { required: false, type: "string", enum: Object.values(ROLES) },
  },
  "query"
);

const validateUserIdParam = validate(
  {
    id: {
      required: true,
      type: "string",
      custom: (value) => (isValidObjectId(value) ? null : "id must be a valid id."),
    },
  },
  "params"
);

const validateInternalBatch = validate({
  userIds: {
    required: true,
    type: "array",
    custom: (values) =>
      values.every((value) => isValidObjectId(value))
        ? null
        : "all userIds must be valid IDs.",
  },
});

module.exports = {
  validateRegister,
  validateLogin,
  validateEmailVerificationRequest,
  validateForgotPassword,
  validateResetPassword,
  validateEmailVerificationConfirm,
  validateEmailVerificationConfirmQuery,
  validateProfileUpdate,
  validatePasswordUpdate,
  validateAdminUserFilters,
  validateUserIdParam,
  validateInternalBatch,
};
