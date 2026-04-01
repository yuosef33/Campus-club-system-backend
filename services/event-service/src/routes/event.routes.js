const express = require("express");
const eventController = require("../controllers/event.controller");
const {
  authenticate,
  authorizeRoles,
  requireApprovedUser,
} = require("../../../../shared/middlewares/auth");
const { requireInternalServiceKey } = require("../../../../shared/middlewares/internalAuth");
const {
  validateCreateEvent,
  validateUpdateEvent,
  validateEventIdParam,
  validateListEventsQuery,
} = require("../validators/event.validator");
const { ROLES } = require("../../../../shared/constants/roles");

const router = express.Router();

router.post(
  "/events",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateCreateEvent,
  eventController.createEvent
);
router.get(
  "/events",
  authenticate,
  requireApprovedUser,
  validateListEventsQuery,
  eventController.listEvents
);
router.get(
  "/events/:id",
  authenticate,
  requireApprovedUser,
  validateEventIdParam,
  eventController.getEventById
);
router.put(
  "/events/:id",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateEventIdParam,
  validateUpdateEvent,
  eventController.updateEvent
);
router.delete(
  "/events/:id",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateEventIdParam,
  eventController.deleteEvent
);

router.post(
  "/internal/events/:id/reserve-seat",
  requireInternalServiceKey,
  validateEventIdParam,
  eventController.reserveSeat
);
router.post(
  "/internal/events/:id/release-seat",
  requireInternalServiceKey,
  validateEventIdParam,
  eventController.releaseSeat
);
router.get(
  "/internal/events/:id",
  requireInternalServiceKey,
  validateEventIdParam,
  eventController.getEventById
);

module.exports = router;
