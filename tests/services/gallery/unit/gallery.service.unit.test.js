describe("gallery.service (unit)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("updatePhoto throws 404 when photo does not exist", async () => {
    const GalleryMock = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      findByIdAndDelete: jest.fn(),
    };

    jest.doMock("../../../../src/models/gallery-photo.model", () => GalleryMock);
    jest.doMock("../../../../src/utils/cloudinary", () => ({
      deleteCloudinaryImage: jest.fn(),
    }));

    const service = require("../../../../src/services/gallery.service");

    await expect(
      service.updatePhoto("507f1f77bcf86cd799439011", { title: "Updated" })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Gallery photo not found.",
    });
  });

  test("deletePhoto removes cloudinary image when publicId exists", async () => {
    const GalleryMock = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findById: jest.fn(),
      findByIdAndDelete: jest.fn().mockResolvedValue({
        _id: "g1",
        publicId: "cloud-id",
      }),
    };
    const cloudinaryMock = {
      deleteCloudinaryImage: jest.fn().mockResolvedValue(null),
    };

    jest.doMock("../../../../src/models/gallery-photo.model", () => GalleryMock);
    jest.doMock("../../../../src/utils/cloudinary", () => cloudinaryMock);

    const service = require("../../../../src/services/gallery.service");
    await service.deletePhoto("g1");

    expect(cloudinaryMock.deleteCloudinaryImage).toHaveBeenCalledWith("cloud-id");
  });
});
