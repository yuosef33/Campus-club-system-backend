describe("announcement.service (unit)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("listAnnouncements applies member visibility filter and pagination", async () => {
    const rows = [{ _id: "a1", title: "Announcement" }];
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(rows),
    };
    const AnnouncementMock = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue(chain),
      countDocuments: jest.fn().mockResolvedValue(1),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    jest.doMock(
      "../../../../src/models/announcement.model",
      () => AnnouncementMock
    );

    const service = require("../../../../src/services/announcement.service");

    const result = await service.listAnnouncements({ role: "user" }, {
      page: "2",
      limit: "5",
    });

    expect(AnnouncementMock.find).toHaveBeenCalledTimes(1);
    expect(chain.skip).toHaveBeenCalledWith(5);
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(result.items).toEqual(rows);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.limit).toBe(5);
  });

  test("updateAnnouncement throws 404 when record does not exist", async () => {
    const AnnouncementMock = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findByIdAndUpdate: jest.fn().mockResolvedValue(null),
      findByIdAndDelete: jest.fn(),
    };

    jest.doMock(
      "../../../../src/models/announcement.model",
      () => AnnouncementMock
    );

    const service = require("../../../../src/services/announcement.service");

    await expect(
      service.updateAnnouncement("507f1f77bcf86cd799439011", {
        title: "Updated",
      })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Announcement not found.",
    });
  });
});
