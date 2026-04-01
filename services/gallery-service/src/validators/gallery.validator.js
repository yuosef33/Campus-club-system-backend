const validate = require("../../../../shared/middlewares/validate");
const {
  isValidDate,
  isValidObjectId,
} = require("../../../../shared/validation/rules");

const validateCreatePhoto = validate({
  title: { required: true, type: "string", minLength: 2, maxLength: 180 },
  description: { required: true, type: "string", minLength: 3, maxLength: 2000 },
  date: {
    required: true,
    type: "string",
    custom: (value) => (isValidDate(value) ? null : "date must be valid."),
  },
  imageUrl: { required: false, type: "string", minLength: 5 },
});

const validateUpdatePhoto = validate({
  title: { required: false, type: "string", minLength: 2, maxLength: 180 },
  description: { required: false, type: "string", minLength: 3, maxLength: 2000 },
  date: {
    required: false,
    type: "string",
    custom: (value) => (isValidDate(value) ? null : "date must be valid."),
  },
  imageUrl: { required: false, type: "string", minLength: 5 },
  publicId: { required: false, type: "string", minLength: 1 },
});

const validatePhotoIdParam = validate(
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
  validateCreatePhoto,
  validateUpdatePhoto,
  validatePhotoIdParam,
};
