let amqpLib = null;
try {
  amqpLib = require("amqplib");
} catch (error) {
  amqpLib = null;
}

let channelPromise = null;

const getExchange = () => process.env.AMQP_EXCHANGE || "campus-club.events";

const getChannel = async () => {
  if (!process.env.AMQP_URL || !amqpLib) {
    return null;
  }

  if (!channelPromise) {
    channelPromise = amqpLib
      .connect(process.env.AMQP_URL)
      .then(async (connection) => {
        const channel = await connection.createChannel();
        await channel.assertExchange(getExchange(), "topic", { durable: true });
        return channel;
      })
      .catch((error) => {
        console.error("[event-bus] RabbitMQ connection failed:", error.message);
        channelPromise = null;
        return null;
      });
  }

  return channelPromise;
};

const publishDomainEvent = async (eventName, payload) => {
  const eventPayload = {
    eventName,
    timestamp: new Date().toISOString(),
    payload,
  };

  const channel = await getChannel();
  if (!channel) {
    if (process.env.NODE_ENV !== "test") {
      console.log("[event-bus] fallback event:", JSON.stringify(eventPayload));
    }
    return;
  }

  channel.publish(
    getExchange(),
    eventName,
    Buffer.from(JSON.stringify(eventPayload)),
    { persistent: true }
  );
};

module.exports = {
  publishDomainEvent,
};
