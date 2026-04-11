const Announcement = require("../models/announcement.model");
const ApiError = require("../utils/ApiError");
const { ROLES } = require("../constants/roles");
const { normalizePagination, buildPaginationMeta } = require("../utils/pagination");

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

const listAnnouncements = async (requestUser, paginationInput = {}) => {
  const query = {};

  if (requestUser?.role !== ROLES.ADMIN) {
    query.$or = [
      { expiresAt: null },
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ];
  }

  const pagination = normalizePagination(paginationInput, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const [items, total] = await Promise.all([
    Announcement.find(query)
      .sort({ pinned: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Announcement.countDocuments(query),
  ]);

  return {
    items,
    pagination: buildPaginationMeta({
      total,
      page: pagination.page,
      limit: pagination.limit,
    }),
  };
};

const updateAnnouncement = async (id, payload) => {
  const announcement = await Announcement.findByIdAndUpdate(
    id,
    normalizeAnnouncementPayload(payload),
    {
      returnDocument: "after",
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
