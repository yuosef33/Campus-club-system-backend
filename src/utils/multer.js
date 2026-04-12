const multer = require("multer");
const ApiError = require("./ApiError");

const storage = multer.memoryStorage();
const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(
      new ApiError(
        400,
        "Only JPG, JPEG, PNG, WEBP, and GIF image files are allowed."
      )
    );
    return;
  }
  cb(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_FILE_SIZE_BYTES,
  },
});

module.exports = {
  uploadImage,
};
