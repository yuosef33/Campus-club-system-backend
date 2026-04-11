const bcrypt = require("bcryptjs");
const {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase,
} = require("../../../helpers/test-db");
const chatService = require("../../../../src/services/chat.service");
const User = require("../../../../src/models/user.model");

describe("chat.service (functional)", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  test("admins can send and list admin chat messages", async () => {
    const admin = await User.create({
      displayName: "Admin One",
      email: "admin240001@bue.edu.eg",
      passwordHash: await bcrypt.hash("Admin@1234", 10),
      role: "admin",
      status: "approved",
      emailVerified: true,
    });

    const sent = await chatService.createMessage({
      senderUserId: admin._id,
      message: "  Hello admins  ",
    });
    expect(sent.message).toBe("Hello admins");

    const list = await chatService.listMessages({ limit: "10" });
    expect(list).toHaveLength(1);
    expect(list[0].senderId.toString()).toBe(admin._id.toString());
    expect(list[0].senderDisplayName).toBe(admin.displayName);
  });

  test("non-admins cannot send admin chat messages", async () => {
    const user = await User.create({
      displayName: "User One",
      email: "student240010@bue.edu.eg",
      passwordHash: await bcrypt.hash("User@1234", 10),
      role: "user",
      status: "approved",
      emailVerified: true,
    });

    await expect(
      chatService.createMessage({
        senderUserId: user._id,
        message: "Should fail",
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Only admins can use admin chat.",
    });
  });
});
