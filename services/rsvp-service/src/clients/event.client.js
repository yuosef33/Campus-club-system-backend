const { EVENT_SERVICE_URL } = require("../../../../shared/config/serviceUrls");
const {
  createServiceClient,
  toApiError,
} = require("../../../../shared/utils/serviceClient");

const eventClient = createServiceClient(EVENT_SERVICE_URL);

const reserveSeat = async (eventId) => {
  try {
    const response = await eventClient.post(`/internal/events/${eventId}/reserve-seat`);
    return response.data?.data;
  } catch (error) {
    throw toApiError(error, "Failed to reserve event seat.");
  }
};

const releaseSeat = async (eventId) => {
  try {
    const response = await eventClient.post(`/internal/events/${eventId}/release-seat`);
    return response.data?.data;
  } catch (error) {
    throw toApiError(error, "Failed to release event seat.");
  }
};

module.exports = {
  reserveSeat,
  releaseSeat,
};
