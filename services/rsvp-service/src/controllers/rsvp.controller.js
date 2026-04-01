const asyncHandler = require("../../../../shared/utils/asyncHandler");
const rsvpService = require("../services/rsvp.service");

const createRsvp = asyncHandler(async (req, res) => {
  const rsvp = await rsvpService.createRsvp({
    eventId: req.body.eventId,
    userId: req.user.userId,
  });

  res.status(201).json({
    success: true,
    message: "RSVP created successfully.",
    data: rsvp,
  });
});

const cancelRsvp = asyncHandler(async (req, res) => {
  const rsvp = await rsvpService.cancelRsvp({
    eventId: req.params.eventId,
    userId: req.user.userId,
  });

  res.status(200).json({
    success: true,
    message: "RSVP cancelled successfully.",
    data: rsvp,
  });
});

const listAttendees = asyncHandler(async (req, res) => {
  const attendees = await rsvpService.listAttendees(req.params.eventId);
  res.status(200).json({ success: true, data: attendees });
});

const listAttendeesInternal = asyncHandler(async (req, res) => {
  const attendees = await rsvpService.listAttendees(req.params.eventId);
  res.status(200).json({ success: true, data: attendees });
});

const listMyRsvps = asyncHandler(async (req, res) => {
  const rsvps = await rsvpService.listMyRsvps(req.user.userId);
  res.status(200).json({ success: true, data: rsvps });
});

module.exports = {
  createRsvp,
  cancelRsvp,
  listAttendees,
  listAttendeesInternal,
  listMyRsvps,
};
