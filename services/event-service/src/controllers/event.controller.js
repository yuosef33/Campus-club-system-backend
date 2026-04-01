const asyncHandler = require("../../../../shared/utils/asyncHandler");
const eventService = require("../services/event.service");
const rsvpClient = require("../clients/rsvp.client");
const { ROLES } = require("../../../../shared/constants/roles");

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.body, req.user.userId);
  res.status(201).json({
    success: true,
    message: "Event created successfully.",
    data: event,
  });
});

const listEvents = asyncHandler(async (req, res) => {
  const type = req.query.type || "all";
  const events = await eventService.listEvents(type);
  res.status(200).json({ success: true, data: events });
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  const eventData =
    typeof event.toObject === "function" ? event.toObject() : event;

  if (req.user?.role === ROLES.ADMIN) {
    const attendees = await rsvpClient.listAttendeesByEvent(req.params.id);
    eventData.attendees = attendees;
  }

  res.status(200).json({ success: true, data: eventData });
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Event updated successfully.",
    data: event,
  });
});

const deleteEvent = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  res.status(200).json({
    success: true,
    message: "Event deleted successfully.",
  });
});

const reserveSeat = asyncHandler(async (req, res) => {
  const event = await eventService.reserveSeat(req.params.id);
  res.status(200).json({
    success: true,
    message: "Seat reserved.",
    data: event,
  });
});

const releaseSeat = asyncHandler(async (req, res) => {
  const event = await eventService.releaseSeat(req.params.id);
  res.status(200).json({
    success: true,
    message: "Seat released.",
    data: event,
  });
});

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  reserveSeat,
  releaseSeat,
};
