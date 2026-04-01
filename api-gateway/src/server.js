require("dotenv").config();
const app = require("./app");

const PORT = Number(process.env.API_GATEWAY_PORT || process.env.PORT || 4000);

app.listen(PORT, () => {
  console.log(`[api-gateway] running on port ${PORT}`);
});
