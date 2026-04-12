const validate = require("../middlewares/validate");
const {
  isValidEmail,
  isStrongPassword,
  isValidObjectId,
  isValidPhoneNumber,
} = require("../validation/rules");
const { ROLES, USER_STATUS } = require("../constants/roles");
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
  phoneNumber: {
    required: false,
    type: "string",
    custom: (value) =>
      isValidPhoneNumber(value) ? null : "phoneNumber must be a valid phone number.",
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

const validateLoginOtpVerify = validate({
  otpToken: { required: true, type: "string", minLength: 20 },
  otpCode: {
    required: true,
    type: "string",
    pattern: /^\d{6}$/,
  },
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
  phoneNumber: {
    required: false,
    type: "string",
    custom: (value) =>
      isValidPhoneNumber(value) ? null : "phoneNumber must be a valid phone number.",
  },
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

const validateOtpSettings = validate({
  enabled: { required: true, type: "boolean" },
  otpCode: { required: false, type: "string", pattern: /^\d{6}$/ },
  setupToken: { required: false, type: "string", minLength: 20 },
});

const validateAdminUserFilters = validate(
  {
    status: { required: false, type: "string", enum: Object.values(USER_STATUS) },
    role: { required: false, type: "string", enum: [ROLES.USER] },
    page: {
      required: false,
      type: "string",
      custom: (value) =>
        /^\d+$/.test(value) && Number.parseInt(value, 10) > 0
          ? null
          : "page must be a positive integer.",
    },
    limit: {
      required: false,
      type: "string",
      custom: (value) =>
        /^\d+$/.test(value) && Number.parseInt(value, 10) > 0
          ? null
          : "limit must be a positive integer.",
    },
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

module.exports = {
  validateRegister,
  validateLogin,
  validateLoginOtpVerify,
  validateEmailVerificationRequest,
  validateForgotPassword,
  validateResetPassword,
  validateEmailVerificationConfirm,
  validateEmailVerificationConfirmQuery,
  validateProfileUpdate,
  validatePasswordUpdate,
  validateOtpSettings,
  validateAdminUserFilters,
  validateUserIdParam,
};
