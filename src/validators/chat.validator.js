const validate = require("../middlewares/validate");

const validateSendAdminChatMessage = validate({
  message: { required: true, type: "string", minLength: 1, maxLength: 2000 },
});

const validateListAdminChatMessages = validate(
  {
    limit: {
      required: false,
      type: "string",
      custom: (value) =>
        /^\d+$/.test(value) && Number.parseInt(value, 10) > 0
          ? null
          : "limit must be a positive integer.",
    },
    before: {
      required: false,
      type: "string",
      custom: (value) =>
        Number.isNaN(new Date(value).getTime())
          ? "before must be a valid datetime."
          : null,
    },
  },
  "query"
);

module.exports = {
  validateSendAdminChatMessage,
  validateListAdminChatMessages,
};
