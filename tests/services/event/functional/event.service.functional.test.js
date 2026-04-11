const mongoose = require("mongoose");
const {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase,
} = require("../../../helpers/test-db");
const eventService = require("../../../../src/services/event.service");
const Event = require("../../../../src/models/event.model");
const RSVP = require("../../../../src/models/rsvp.model");

describe("event.service (functional)", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  test("creates, updates, paginates, reserves/releases seats, and deletes with RSVP cascade", async () => {
    const adminId = new mongoose.Types.ObjectId();
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const created = await eventService.createEvent(
      {
        title: "Hackathon",
        description: "Coding event",
        date: futureDate,
        location: "Campus Hall",
        capacity: 1,
      },
      adminId
    );
    expect(created.attendeeCount).toBe(0);
    expect(created.isOpen).toBe(true);

    const listed = await eventService.listEvents("all", { page: "1", limit: "10" });
    expect(listed.items).toHaveLength(1);
    expect(listed.pagination.total).toBe(1);

    const updated = await eventService.updateEvent(created._id, {
      title: "Hackathon 2",
      capacity: 2,
    });
    expect(updated.title).toBe("Hackathon 2");
    expect(updated.capacity).toBe(2);

    const afterReserve = await eventService.reserveSeat(created._id);
    expect(afterReserve.attendeeCount).toBe(1);

    const afterRelease = await eventService.releaseSeat(created._id);
    expect(afterRelease.attendeeCount).toBe(0);

    await RSVP.create({
      eventId: created._id,
      userId: new mongoose.Types.ObjectId(),
    });
    await eventService.deleteEvent(created._id);

    expect(await Event.countDocuments({ _id: created._id })).toBe(0);
    expect(await RSVP.countDocuments({ eventId: created._id })).toBe(0);
  });
});
