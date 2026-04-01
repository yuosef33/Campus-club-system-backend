const express = require("express");
const announcementController = require("../controllers/announcement.controller");
const {
  authenticate,
  authorizeRoles,
  requireApprovedUser,
} = require("../../../../shared/middlewares/auth");
const { ROLES } = require("../../../../shared/constants/roles");
const {
  validateCreateAnnouncement,
  validateUpdateAnnouncement,
  validateAnnouncementIdParam,
} = require("../validators/announcement.validator");

const router = express.Router();

router.post(
  "/announcements",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateCreateAnnouncement,
  announcementController.createAnnouncement
);
router.get(
  "/announcements",
  authenticate,
  requireApprovedUser,
  announcementController.listAnnouncements
);
router.put(
  "/announcements/:id",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateAnnouncementIdParam,
  validateUpdateAnnouncement,
  announcementController.updateAnnouncement
);
router.delete(
  "/announcements/:id",
  authenticate,
  requireApprovedUser,
  authorizeRoles(ROLES.ADMIN),
  validateAnnouncementIdParam,
  announcementController.deleteAnnouncement
);

module.exports = router;
