const mongoose = require("mongoose");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const isValidEmail = (email) => EMAIL_REGEX.test(email);
const isStrongPassword = (password) => STRONG_PASSWORD_REGEX.test(password);
const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidDate,
  isValidObjectId,
};
