const Announcement = require("../models/announcement.model");
const ApiError = require("../../../../shared/utils/ApiError");

const createAnnouncement = async (payload, adminUserId) =>
  Announcement.create({
    ...payload,
    createdBy: adminUserId,
  });

const listAnnouncements = async () =>
  Announcement.find().sort({ createdAt: -1 });

const updateAnnouncement = async (id, payload) => {
  const announcement = await Announcement.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!announcement) {
    throw new ApiError(404, "Announcement not found.");
  }

  return announcement;
};

const deleteAnnouncement = async (id) => {
  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    throw new ApiError(404, "Announcement not found.");
  }
};

module.exports = {
  createAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
