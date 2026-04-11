const mongoose = require("mongoose");
const {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase,
} = require("../../../helpers/test-db");
const galleryService = require("../../../../src/services/gallery.service");
const GalleryPhoto = require("../../../../src/models/gallery-photo.model");

describe("gallery.service (functional)", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  test("creates, lists, updates, and deletes gallery photos", async () => {
    const adminId = new mongoose.Types.ObjectId();
    const created = await galleryService.createPhoto(
      {
        title: "Photo 1",
        description: "Gallery photo",
        date: "2099-01-01T00:00:00.000Z",
        imageUrl: "https://example.com/photo-1.jpg",
        publicId: null,
      },
      adminId
    );

    expect(created.title).toBe("Photo 1");
    expect(created.uploadedBy.toString()).toBe(adminId.toString());

    const listed = await galleryService.listPhotos({ page: "1", limit: "10" });
    expect(listed.items).toHaveLength(1);
    expect(listed.pagination.total).toBe(1);

    const updated = await galleryService.updatePhoto(created._id, {
      title: "Photo 1 Updated",
      description: "Updated description",
    });
    expect(updated.title).toBe("Photo 1 Updated");

    await galleryService.deletePhoto(created._id);
    expect(await GalleryPhoto.countDocuments({ _id: created._id })).toBe(0);
  });
});
