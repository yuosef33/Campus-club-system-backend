const Event = require("../models/event.model");
const RSVP = require("../models/rsvp.model");
const ApiError = require("../utils/ApiError");
const { normalizePagination, buildPaginationMeta } = require("../utils/pagination");
const { runWithTransactionFallback } = require("../utils/transaction");

const now = () => new Date();

const computeOpenState = (dateValue, attendeeCount, capacity) =>
  new Date(dateValue) >= now() && attendeeCount < capacity;

const createEvent = async (payload, adminUserId) => {
  const event = await Event.create({
    ...payload,
    date: new Date(payload.date),
    attendeeCount: 0,
    isOpen: computeOpenState(payload.date, 0, payload.capacity),
    createdBy: adminUserId,
  });

  return event;
};

const listEvents = async (type = "all", paginationInput = {}) => {
  const query = {};
  const currentDate = now();

  if (type === "upcoming") {
    query.date = { $gte: currentDate };
  } else if (type === "past") {
    query.date = { $lt: currentDate };
  }

  const sort = type === "past" ? { date: -1 } : { date: 1 };
  const pagination = normalizePagination(paginationInput, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const [items, total] = await Promise.all([
    Event.find(query).sort(sort).skip(pagination.skip).limit(pagination.limit),
    Event.countDocuments(query),
  ]);

  return {
    items,
    pagination: buildPaginationMeta({
      total,
      page: pagination.page,
      limit: pagination.limit,
    }),
  };
};

const getEventById = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found.");
  }
  return event;
};

const updateEvent = async (eventId, payload) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found.");
  }

  if (
    payload.capacity !== undefined &&
    payload.capacity !== null &&
    payload.capacity < event.attendeeCount
  ) {
    throw new ApiError(
      400,
      "capacity cannot be lower than current attendee count."
    );
  }

  if (payload.title !== undefined) event.title = payload.title;
  if (payload.description !== undefined) event.description = payload.description;
  if (payload.location !== undefined) event.location = payload.location;
  if (payload.capacity !== undefined) event.capacity = payload.capacity;
  if (payload.date !== undefined) event.date = new Date(payload.date);

  event.isOpen = computeOpenState(event.date, event.attendeeCount, event.capacity);
  await event.save();

  return event;
};

const deleteEvent = async (eventId) => {
  await runWithTransactionFallback(async (session) => {
    const findOptions = session ? { session } : {};
    const existing = await Event.findById(eventId, null, findOptions);
    if (!existing) {
      throw new ApiError(404, "Event not found.");
    }

    const writeOptions = session ? { session } : {};
    await RSVP.deleteMany({ eventId }, writeOptions);
    await Event.findByIdAndDelete(eventId, writeOptions);
  });
};

const reserveSeat = async (eventId, options = {}) => {
  const session = options.session || null;
  const currentDate = now();
  const event = await Event.findOneAndUpdate(
    {
      _id: eventId,
      isOpen: true,
      date: { $gte: currentDate },
      $expr: { $lt: ["$attendeeCount", "$capacity"] },
    },
    { $inc: { attendeeCount: 1 } },
    { returnDocument: "after", ...(session ? { session } : {}) }
  );

  if (!event) {
    const existing = await Event.findById(eventId, null, session ? { session } : {});
    if (!existing) {
      throw new ApiError(404, "Event not found.");
    }
    if (existing.date < currentDate) {
      throw new ApiError(400, "Cannot RSVP to past events.");
    }
    if (!existing.isOpen || existing.attendeeCount >= existing.capacity) {
      throw new ApiError(409, "Event is full and closed for RSVP.");
    }
    throw new ApiError(400, "Unable to reserve seat for this event.");
  }

  if (event.attendeeCount >= event.capacity && event.isOpen) {
    event.isOpen = false;
    await event.save(session ? { session } : {});
  }

  return event;
};

const releaseSeat = async (eventId, options = {}) => {
  const session = options.session || null;
  const event = await Event.findOneAndUpdate(
    { _id: eventId, attendeeCount: { $gt: 0 } },
    { $inc: { attendeeCount: -1 } },
    { returnDocument: "after", ...(session ? { session } : {}) }
  );

  if (!event) {
    throw new ApiError(404, "Event not found.");
  }

  event.isOpen = computeOpenState(event.date, event.attendeeCount, event.capacity);
  await event.save(session ? { session } : {});

  return event;
};

module.exports = {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  reserveSeat,
  releaseSeat,
};
