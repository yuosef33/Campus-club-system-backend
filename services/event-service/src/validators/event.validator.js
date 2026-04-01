const validate = require("../../../../shared/middlewares/validate");
const {
  isValidDate,
  isValidObjectId,
} = require("../../../../shared/validation/rules");

const eventBaseSchema = {
  title: { required: true, type: "string", minLength: 3, maxLength: 120 },
  description: {
    required: true,
    type: "string",
    minLength: 5,
    maxLength: 1500,
  },
  date: {
    required: true,
    type: "string",
    custom: (value) => (isValidDate(value) ? null : "date must be valid."),
  },
  location: { required: true, type: "string", minLength: 2, maxLength: 200 },
  capacity: {
    required: true,
    type: "number",
    min: 1,
    custom: (value) =>
      Number.isInteger(value) ? null : "capacity must be a positive integer.",
  },
};

const validateCreateEvent = validate(eventBaseSchema);

const validateUpdateEvent = validate({
  title: { required: false, type: "string", minLength: 3, maxLength: 120 },
  description: {
    required: false,
    type: "string",
    minLength: 5,
    maxLength: 1500,
  },
  date: {
    required: false,
    type: "string",
    custom: (value) => (isValidDate(value) ? null : "date must be valid."),
  },
  location: { required: false, type: "string", minLength: 2, maxLength: 200 },
  capacity: {
    required: false,
    type: "number",
    min: 1,
    custom: (value) =>
      Number.isInteger(value) ? null : "capacity must be a positive integer.",
  },
});

const validateEventIdParam = validate(
  {
    id: {
      required: true,
      type: "string",
      custom: (value) => (isValidObjectId(value) ? null : "id must be valid."),
    },
  },
  "params"
);

const validateListEventsQuery = validate(
  {
    type: {
      required: false,
      type: "string",
      enum: ["upcoming", "past", "all"],
    },
  },
  "query"
);

module.exports = {
  validateCreateEvent,
  validateUpdateEvent,
  validateEventIdParam,
  validateListEventsQuery,
};
