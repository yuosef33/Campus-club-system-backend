const getServiceUrl = (envKey, defaultPort) =>
  process.env[envKey] || `http://localhost:${defaultPort}`;

module.exports = {
  AUTH_SERVICE_URL: getServiceUrl("AUTH_SERVICE_URL", 4001),
  EVENT_SERVICE_URL: getServiceUrl("EVENT_SERVICE_URL", 4002),
  RSVP_SERVICE_URL: getServiceUrl("RSVP_SERVICE_URL", 4003),
  ANNOUNCEMENT_SERVICE_URL: getServiceUrl("ANNOUNCEMENT_SERVICE_URL", 4004),
  GALLERY_SERVICE_URL: getServiceUrl("GALLERY_SERVICE_URL", 4005),
};
