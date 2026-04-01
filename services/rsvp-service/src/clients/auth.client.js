const { AUTH_SERVICE_URL } = require("../../../../shared/config/serviceUrls");
const {
  createServiceClient,
  toApiError,
} = require("../../../../shared/utils/serviceClient");

const authClient = createServiceClient(AUTH_SERVICE_URL);

const getUsersByIds = async (userIds) => {
  try {
    const response = await authClient.post("/internal/users/batch", { userIds });
    return response.data?.data || [];
  } catch (error) {
    throw toApiError(error, "Failed to fetch users from auth service.");
  }
};

module.exports = {
  getUsersByIds,
};
