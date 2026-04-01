const GalleryPhoto = require("../models/gallery-photo.model");
const ApiError = require("../../../../shared/utils/ApiError");
const {
  deleteCloudinaryImage,
} = require("../../../../shared/utils/cloudinary");
const {
  publishDomainEvent,
} = require("../../../../shared/events/eventBus");
const DOMAIN_EVENTS = require("../../../../shared/events/domainEvents");

const createPhoto = async (payload, adminUserId) => {
  const photo = await GalleryPhoto.create({
    ...payload,
    date: new Date(payload.date),
    uploadedBy: adminUserId,
  });

  await publishDomainEvent(DOMAIN_EVENTS.GALLERY_IMAGE_ADDED, {
    photoId: photo._id.toString(),
    title: photo.title,
    imageUrl: photo.imageUrl,
  });

  return photo;
};

const listPhotos = async () => GalleryPhoto.find().sort({ date: -1, createdAt: -1 });

const updatePhoto = async (photoId, payload) => {
  const photo = await GalleryPhoto.findById(photoId);
  if (!photo) {
    throw new ApiError(404, "Gallery photo not found.");
  }

  if (payload.publicId && photo.publicId && payload.publicId !== photo.publicId) {
    await deleteCloudinaryImage(photo.publicId);
  }

  if (payload.title !== undefined) photo.title = payload.title;
  if (payload.description !== undefined) photo.description = payload.description;
  if (payload.date !== undefined) photo.date = new Date(payload.date);
  if (payload.imageUrl !== undefined) photo.imageUrl = payload.imageUrl;
  if (payload.publicId !== undefined) photo.publicId = payload.publicId;
  if (!photo.description) photo.description = "No description provided.";

  await photo.save();
  return photo;
};

const deletePhoto = async (photoId) => {
  const photo = await GalleryPhoto.findByIdAndDelete(photoId);
  if (!photo) {
    throw new ApiError(404, "Gallery photo not found.");
  }

  if (photo.publicId) {
    await deleteCloudinaryImage(photo.publicId);
  }
};

module.exports = {
  createPhoto,
  listPhotos,
  updatePhoto,
  deletePhoto,
};
