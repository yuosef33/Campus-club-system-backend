const express = require("express");
const chatController = require("../controllers/chat.controller");
const {
  authenticate,
  authorizeRoles,
  requireApprovedUser,
} = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  validateSendAdminChatMessage,
  validateListAdminChatMessages,
} = require("../validators/chat.validator");

const router = express.Router();

router.post(
  "/admin/chat/messages",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateSendAdminChatMessage,
  chatController.sendAdminMessage
);

router.get(
  "/admin/chat/messages",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateListAdminChatMessages,
  chatController.listAdminMessages
);

module.exports = router;
