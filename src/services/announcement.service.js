const Announcement = require("../models/announcement.model");
const ApiError = require("../utils/ApiError");
const { ROLES } = require("../constants/roles");

const normalizeAnnouncementPayload = (payload) => {
  const normalizedPayload = { ...payload };

  if (Object.prototype.hasOwnProperty.call(normalizedPayload, "expiresAt")) {
    normalizedPayload.expiresAt = normalizedPayload.expiresAt
      ? new Date(normalizedPayload.expiresAt)
      : null;
  }

  if (Object.prototype.hasOwnProperty.call(normalizedPayload, "pinned")) {
    normalizedPayload.pinned = Boolean(normalizedPayload.pinned);
  }

  return normalizedPayload;
};

const createAnnouncement = async (payload, adminUserId) =>
  Announcement.create({
    ...normalizeAnnouncementPayload(payload),
    createdBy: adminUserId,
  });

const listAnnouncements = async (requestUser) => {
  const query = {};

  if (requestUser?.role !== ROLES.ADMIN) {
    query.$or = [
      { expiresAt: null },
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ];
  }

  return Announcement.find(query).sort({ pinned: -1, createdAt: -1 });
};

const updateAnnouncement = async (id, payload) => {
  const announcement = await Announcement.findByIdAndUpdate(
    id,
    normalizeAnnouncementPayload(payload),
    {
    new: true,
    runValidators: true,
    }
  );

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
