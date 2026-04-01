require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const {
  AUTH_SERVICE_URL,
  EVENT_SERVICE_URL,
  RSVP_SERVICE_URL,
  ANNOUNCEMENT_SERVICE_URL,
  GALLERY_SERVICE_URL,
} = require("../../shared/config/serviceUrls");
const notFound = require("../../shared/middlewares/notFound");
const errorHandler = require("../../shared/middlewares/errorHandler");

const app = express();

const createProxy = (target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    ...(pathRewrite ? { pathRewrite } : {}),
    onError: (err, req, res) => {
      res.status(502).json({
        success: false,
        message: `Gateway proxy error: ${err.message}`,
      });
    },
  });

const matchAndProxy = (matcher, proxyMiddleware) => (req, res, next) => {
  if (matcher(req.path, req)) {
    return proxyMiddleware(req, res, next);
  }
  return next();
};

app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

const authProxy = createProxy(AUTH_SERVICE_URL);
const authUsersAdminProxy = createProxy(AUTH_SERVICE_URL);
const rsvpProxy = createProxy(RSVP_SERVICE_URL);
const eventProxy = createProxy(EVENT_SERVICE_URL);
const announcementProxy = createProxy(ANNOUNCEMENT_SERVICE_URL);
const galleryProxy = createProxy(GALLERY_SERVICE_URL);

app.use(
  "/api/v1",
  matchAndProxy((path) => path === "/auth" || path.startsWith("/auth/"), authProxy)
);
app.use(
  "/api/v1",
  matchAndProxy(
    (path) =>
      path === "/users" ||
      path.startsWith("/users/") ||
      path === "/admin" ||
      path.startsWith("/admin/"),
    authUsersAdminProxy
  )
);

// RSVP must be checked before generic /events routes
app.use(
  "/api/v1",
  matchAndProxy(
    (path) =>
      path === "/rsvps" ||
      path.startsWith("/rsvps/") ||
      /^\/events\/[^/]+\/attendees$/.test(path),
    rsvpProxy
  )
);

app.use(
  "/api/v1",
  matchAndProxy((path) => path === "/events" || path.startsWith("/events/"), eventProxy)
);
app.use(
  "/api/v1",
  matchAndProxy(
    (path) => path === "/announcements" || path.startsWith("/announcements/"),
    announcementProxy
  )
);
app.use(
  "/api/v1",
  matchAndProxy((path) => path === "/gallery" || path.startsWith("/gallery/"), galleryProxy)
);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
