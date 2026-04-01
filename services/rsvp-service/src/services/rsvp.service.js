const RSVP = require("../models/rsvp.model");
const ApiError = require("../../../../shared/utils/ApiError");
const eventClient = require("../clients/event.client");
const authClient = require("../clients/auth.client");
const {
  publishDomainEvent,
} = require("../../../../shared/events/eventBus");
const DOMAIN_EVENTS = require("../../../../shared/events/domainEvents");

const createRsvp = async ({ eventId, userId }) => {
  const existing = await RSVP.findOne({ eventId, userId });
  if (existing) {
    throw new ApiError(409, "You already RSVP'd to this event.");
  }

  await eventClient.reserveSeat(eventId);

  try {
    const rsvp = await RSVP.create({ eventId, userId });

    await publishDomainEvent(DOMAIN_EVENTS.RSVP_CREATED, {
      rsvpId: rsvp._id.toString(),
      eventId,
      userId,
    });

    return rsvp;
  } catch (error) {
    try {
      await eventClient.releaseSeat(eventId);
    } catch (rollbackError) {
      console.error(
        "[rsvp-service] failed to rollback seat after RSVP creation error:",
        rollbackError.message
      );
    }

    if (error.code === 11000) {
      throw new ApiError(409, "You already RSVP'd to this event.");
    }

    throw error;
  }
};

const cancelRsvp = async ({ eventId, userId }) => {
  const rsvp = await RSVP.findOneAndDelete({ eventId, userId });
  if (!rsvp) {
    throw new ApiError(404, "RSVP not found for this user/event.");
  }

  await eventClient.releaseSeat(eventId);

  await publishDomainEvent(DOMAIN_EVENTS.RSVP_CANCELLED, {
    rsvpId: rsvp._id.toString(),
    eventId,
    userId,
  });

  return rsvp;
};

const listAttendees = async (eventId) => {
  const rsvps = await RSVP.find({ eventId }).sort({ createdAt: 1 });

  if (rsvps.length === 0) {
    return [];
  }

  const userIds = rsvps.map((item) => item.userId);
  const users = await authClient.getUsersByIds(userIds);
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return rsvps.map((rsvp) => ({
    rsvpId: rsvp._id.toString(),
    eventId: rsvp.eventId,
    userId: rsvp.userId,
    rsvpDate: rsvp.createdAt,
    member: userMap.get(rsvp.userId) || null,
  }));
};

const listMyRsvps = async (userId) =>
  RSVP.find({ userId }).sort({ createdAt: -1 }).lean();

module.exports = {
  createRsvp,
  cancelRsvp,
  listAttendees,
  listMyRsvps,
};
