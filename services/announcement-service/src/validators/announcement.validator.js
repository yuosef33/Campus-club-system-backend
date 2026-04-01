const validate = require("../../../../shared/middlewares/validate");
const { isValidObjectId } = require("../../../../shared/validation/rules");

const validateCreateAnnouncement = validate({
  title: { required: true, type: "string", minLength: 3, maxLength: 180 },
  content: { required: true, type: "string", minLength: 5, maxLength: 5000 },
});

const validateUpdateAnnouncement = validate({
  title: { required: false, type: "string", minLength: 3, maxLength: 180 },
  content: { required: false, type: "string", minLength: 5, maxLength: 5000 },
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
