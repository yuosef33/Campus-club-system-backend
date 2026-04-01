const asyncHandler = require("../../../../shared/utils/asyncHandler");
const announcementService = require("../services/announcement.service");

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.createAnnouncement(
    req.body,
    req.user.userId
  );
  res.status(201).json({
    success: true,
    message: "Announcement created successfully.",
    data: announcement,
  });
});

const listAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.listAnnouncements();
  res.status(200).json({ success: true, data: announcements });
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await announcementService.updateAnnouncement(
    req.params.id,
    req.body
  );
  res.status(200).json({
    success: true,
    message: "Announcement updated successfully.",
    data: announcement,
  });
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncement(req.params.id);
  res.status(200).json({
    success: true,
    message: "Announcement deleted successfully.",
  });
});

module.exports = {
  createAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
