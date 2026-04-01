const { RSVP_SERVICE_URL } = require("../../../../shared/config/serviceUrls");
const {
  createServiceClient,
  toApiError,
} = require("../../../../shared/utils/serviceClient");

const rsvpClient = createServiceClient(RSVP_SERVICE_URL);

const listAttendeesByEvent = async (eventId) => {
  try {
    const response = await rsvpClient.get(`/internal/events/${eventId}/attendees`);
    return response.data?.data || [];
  } catch (error) {
    throw toApiError(error, "Failed to fetch event attendees.");
  }
};

module.exports = {
  listAttendeesByEvent,
};
