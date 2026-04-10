const mongoose = require("mongoose");

const adminChatMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderDisplayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const AdminChatMessage = mongoose.model("AdminChatMessage", adminChatMessageSchema);

module.exports = AdminChatMessage;
