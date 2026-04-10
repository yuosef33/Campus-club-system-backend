require("dotenv").config();
const express = require("express");
const cors = require("cors");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const rsvpRoutes = require("./routes/rsvp.routes");
const announcementRoutes = require("./routes/announcement.routes");
const galleryRoutes = require("./routes/gallery.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "campus-club-monolith",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", authRoutes);
app.use("/api/v1", rsvpRoutes);
app.use("/api/v1", eventRoutes);
app.use("/api/v1", announcementRoutes);
app.use("/api/v1", galleryRoutes);
app.use("/api/v1", chatRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
