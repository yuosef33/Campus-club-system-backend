const User = require("../models/user.model");

exports.getAllUsers = async () => {
  return await User.find();
};

exports.createUser = async (data) => {
  return await User.create(data);
};