const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase,
  runIfDatabaseAvailable,
  logSkipIfDatabaseUnavailable,
} = require("../../../helpers/test-db");
const rsvpService = require("../../../../src/services/rsvp.service");
const Event = require("../../../../src/models/event.model");
const RSVP = require("../../../../src/models/rsvp.model");
const User = require("../../../../src/models/user.model");

describe("rsvp.service (functional)", () => {
  beforeAll(async () => {
    const connected = await connectTestDatabase();
    if (!connected) {
      logSkipIfDatabaseUnavailable();
    }
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  runIfDatabaseAvailable(
    "creates, lists, and cancels RSVPs while syncing event seat counts",
    async () => {
    const admin = await User.create({
      displayName: "Admin",
      email: "admin240100@bue.edu.eg",
      passwordHash: await bcrypt.hash("Admin@1234", 10),
      role: "admin",
      status: "approved",
      emailVerified: true,
    });

    const member = await User.create({
      displayName: "Member",
      email: "student240100@bue.edu.eg",
      passwordHash: await bcrypt.hash("User@1234", 10),
      role: "user",
      status: "approved",
      emailVerified: true,
    });

    const event = await Event.create({
      title: "Cloud Workshop",
      description: "Workshop",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      location: "Lab 1",
      capacity: 2,
      attendeeCount: 0,
      isOpen: true,
      createdBy: admin._id,
    });

    const createdRsvp = await rsvpService.createRsvp({
      eventId: event._id,
      userId: member._id,
    });
    expect(createdRsvp.eventId.toString()).toBe(event._id.toString());

    const updatedEvent = await Event.findById(event._id);
    expect(updatedEvent.attendeeCount).toBe(1);

    const myRsvps = await rsvpService.listMyRsvps(member._id, {
      page: "1",
      limit: "10",
    });
    expect(myRsvps.items).toHaveLength(1);
    expect(myRsvps.items[0].eventId).toBe(event._id.toString());

    const attendees = await rsvpService.listAttendees(event._id, {
      page: "1",
      limit: "10",
    });
    expect(attendees.items).toHaveLength(1);
    expect(attendees.items[0].member.email).toBe(member.email);

    await rsvpService.cancelRsvp({
      eventId: event._id,
      userId: member._id,
    });

    const afterCancelEvent = await Event.findById(event._id);
    expect(afterCancelEvent.attendeeCount).toBe(0);
    expect(await RSVP.countDocuments({ eventId: event._id })).toBe(0);
    }
  );
});
