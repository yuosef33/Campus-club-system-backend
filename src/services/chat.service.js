const AdminChatMessage = require("../models/admin-chat-message.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const { ROLES } = require("../constants/roles");

const MAX_LIMIT = 200;

const normalizeLimit = (value) => {
  const parsed = Number.parseInt(String(value || "50"), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 50;
  return Math.min(parsed, MAX_LIMIT);
};

const assertAdminUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.role !== ROLES.ADMIN) {
    throw new ApiError(403, "Only admins can use admin chat.");
  }

  return user;
};

const createMessage = async ({ senderUserId, message }) => {
  const sender = await assertAdminUser(senderUserId);

  const chatMessage = await AdminChatMessage.create({
    senderId: sender._id.toString(),
    senderDisplayName: sender.displayName,
    message: String(message).trim(),
  });

  return chatMessage;
};

const listMessages = async ({ limit, before }) => {
  const query = {};

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const safeLimit = normalizeLimit(limit);
  const rows = await AdminChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  return rows.reverse();
};

module.exports = {
  createMessage,
  listMessages,
};
