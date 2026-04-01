const axios = require("axios");
const ApiError = require("./ApiError");

const createServiceClient = (baseURL) =>
  axios.create({
    baseURL,
    timeout: 8000,
    headers: {
      "Content-Type": "application/json",
      ...(process.env.SERVICE_AUTH_KEY
        ? { "x-service-key": process.env.SERVICE_AUTH_KEY }
        : {}),
    },
  });

const toApiError = (error, fallbackMessage = "Service request failed.") => {
  if (error.response) {
    const message = error.response.data?.message || fallbackMessage;
    return new ApiError(error.response.status || 502, message, error.response.data);
  }

  if (error.request) {
    return new ApiError(503, fallbackMessage);
  }

  return new ApiError(500, error.message || fallbackMessage);
};

module.exports = {
  createServiceClient,
  toApiError,
};
