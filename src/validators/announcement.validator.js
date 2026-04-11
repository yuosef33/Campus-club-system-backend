const validate = require("../middlewares/validate");
const { isValidDate, isValidObjectId } = require("../validation/rules");

const validateExpiresAt = (value) => {
  if (value === null || value === "") {
    return null;
  }

  if (!isValidDate(value)) {
    return "expiresAt must be a valid date.";
  }

  return null;
};

const validateCreateAnnouncement = validate({
  title: { required: true, type: "string", minLength: 3, maxLength: 180 },
  content: { required: true, type: "string", minLength: 5, maxLength: 5000 },
  pinned: { required: false, type: "boolean" },
  expiresAt: {
    required: false,
    type: "string",
    custom: validateExpiresAt,
  },
});

const validateUpdateAnnouncement = validate({
  title: { required: false, type: "string", minLength: 3, maxLength: 180 },
  content: { required: false, type: "string", minLength: 5, maxLength: 5000 },
  pinned: { required: false, type: "boolean" },
  expiresAt: {
    required: false,
    type: "string",
    custom: validateExpiresAt,
  },
});

const validateAnnouncementIdParam = validate(
  {
    id: {
      required: true,
      type: "string",
      custom: (value) => (isValidObjectId(value) ? null : "id must be valid."),
    },
  },
  "params"
);

module.exports = {
  validateCreateAnnouncement,
  validateUpdateAnnouncement,
  validateAnnouncementIdParam,
};
