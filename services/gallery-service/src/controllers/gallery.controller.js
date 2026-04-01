const asyncHandler = require("../../../../shared/utils/asyncHandler");
const ApiError = require("../../../../shared/utils/ApiError");
const galleryService = require("../services/gallery.service");
const {
  uploadImageBuffer,
  isCloudinaryConfigured,
} = require("../../../../shared/utils/cloudinary");

const createPhoto = asyncHandler(async (req, res) => {
  let imageUrl = req.body.imageUrl;
  let publicId = null;

  if (req.file) {
    const uploadResult = await uploadImageBuffer(
      req.file.buffer,
      "campus-club/gallery",
      req.file.mimetype
    );
    imageUrl = uploadResult.secure_url;
    publicId = uploadResult.public_id;
  }

  if (!imageUrl) {
    throw new ApiError(
      400,
      isCloudinaryConfigured()
        ? "Provide imageUrl or upload an image file."
        : "Provide imageUrl. Cloudinary is not configured for file uploads."
    );
  }

  const photo = await galleryService.createPhoto(
    {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      imageUrl,
      publicId,
    },
    req.user.userId
  );

  res.status(201).json({
    success: true,
    message: "Gallery photo added successfully.",
    data: photo,
  });
});

const listPhotos = asyncHandler(async (req, res) => {
  const photos = await galleryService.listPhotos();
  res.status(200).json({ success: true, data: photos });
});

const updatePhoto = asyncHandler(async (req, res) => {
  let imageUrl = req.body.imageUrl;
  let publicId = req.body.publicId;

  if (req.file) {
    const uploadResult = await uploadImageBuffer(
      req.file.buffer,
      "campus-club/gallery",
      req.file.mimetype
    );
    imageUrl = uploadResult.secure_url;
    publicId = uploadResult.public_id;
  }

  const photo = await galleryService.updatePhoto(req.params.id, {
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    imageUrl,
    publicId,
  });

  res.status(200).json({
    success: true,
    message: "Gallery photo updated successfully.",
    data: photo,
  });
});

const deletePhoto = asyncHandler(async (req, res) => {
  await galleryService.deletePhoto(req.params.id);
  res.status(200).json({
    success: true,
    message: "Gallery photo deleted successfully.",
  });
});

module.exports = {
  createPhoto,
  listPhotos,
  updatePhoto,
  deletePhoto,
};
