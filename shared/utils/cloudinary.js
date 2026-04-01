const { v2: cloudinary } = require("cloudinary");
const ApiError = require("./ApiError");

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const configureCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return true;
};

const uploadImageBuffer = async (buffer, folder, mimetype = "image/jpeg") => {
  if (!configureCloudinary()) {
    throw new ApiError(
      500,
      "Cloudinary is not configured. Please provide CLOUDINARY_* environment variables."
    );
  }

  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;

  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });
};

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId || !configureCloudinary()) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

module.exports = {
  isCloudinaryConfigured,
  uploadImageBuffer,
  deleteCloudinaryImage,
};
