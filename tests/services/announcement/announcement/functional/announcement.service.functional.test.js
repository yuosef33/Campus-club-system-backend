const mongoose = require("mongoose");
const {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase,
} = require("../../../helpers/test-db");
const announcementService = require("../../../../src/services/announcement.service");
const Announcement = require("../../../../src/models/announcement.model");
const { ROLES } = require("../../../../src/constants/roles");

describe("announcement.service (functional)", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  test("creates, lists, updates, and deletes announcements", async () => {
    const adminId = new mongoose.Types.ObjectId();

    const created = await announcementService.createAnnouncement(
      {
        title: "Welcome",
        content: "Welcome everyone",
        pinned: true,
        expiresAt: "2099-01-01T00:00:00.000Z",
      },
      adminId
    );

    expect(created.title).toBe("Welcome");
    expect(created.createdBy.toString()).toBe(adminId.toString());

    const listAsMember = await announcementService.listAnnouncements(
      { role: ROLES.USER },
      { page: "1", limit: "10" }
    );
    expect(listAsMember.items).toHaveLength(1);
    expect(listAsMember.pagination.total).toBe(1);

    const updated = await announcementService.updateAnnouncement(created._id, {
      title: "Welcome Updated",
      pinned: false,
    });
    expect(updated.title).toBe("Welcome Updated");
    expect(updated.pinned).toBe(false);

    await announcementService.deleteAnnouncement(created._id);
    const remaining = await Announcement.countDocuments({});
    expect(remaining).toBe(0);
  });
});
