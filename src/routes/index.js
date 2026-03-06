const express = require("express");
const router = express.Router();

// Import module routes
// Note: The actual route files should be created in the respective module directories under src/modules
// uncomment when done
// const authRoutes = require("../modules/auth/auth.routes");
// const userRoutes = require("../modules/users/users.routes");
// const clubRoutes = require("../modules/clubs/clubs.routes");
// const roleRoutes = require("../modules/roles/roles.routes");
// const membershipRoutes = require("../modules/membership/membership.routes");
// const eventRoutes = require("../modules/events/events.routes");
// const rsvpRoutes = require("../modules/rsvp/rsvp.routes");
// const attendanceRoutes = require("../modules/attendance/attendance.routes");
// const announcementRoutes = require("../modules/announcements/announcements.routes");
// const mediaRoutes = require("../modules/media/media.routes");

// Mount routes

// Test
router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Auth
// router.use("/auth", authRoutes);

// Users
// router.use("/users", userRoutes);

// Clubs
// router.use("/clubs", clubRoutes);

// Roles (club roles)
// router.use("/clubs/:clubId/roles", roleRoutes);

// Membership (members + join requests)
// router.use("/clubs/:clubId/members", membershipRoutes);
// router.use("/clubs/:clubId/join-requests", membershipRoutes);

// Events
// router.use("/clubs/:clubId/events", eventRoutes);

// RSVP
// router.use("/events/:eventId/rsvp", rsvpRoutes);

// Attendance
// router.use("/events/:eventId/attendance", attendanceRoutes);

// Announcements
// router.use("/clubs/:clubId/announcements", announcementRoutes);

// Media
// router.use("/clubs/:clubId/media", mediaRoutes);

module.exports = router;