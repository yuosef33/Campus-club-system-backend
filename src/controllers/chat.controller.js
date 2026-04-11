const asyncHandler = require("../utils/asyncHandler");
const chatService = require("../services/chat.service");

const sendAdminMessage = asyncHandler(async (req, res) => {
  const message = await chatService.createMessage({
    senderUserId: req.user.userId,
    message: req.body.message,
  });

  res.status(201).json({
    success: true,
    message: "Admin chat message sent successfully.",
    data: message,
  });
});

const listAdminMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.listMessages({
    limit: req.query.limit,
    before: req.query.before,
  });

  res.status(200).json({
    success: true,
    data: messages,
  });
});

module.exports = {
  sendAdminMessage,
  listAdminMessages,
};
