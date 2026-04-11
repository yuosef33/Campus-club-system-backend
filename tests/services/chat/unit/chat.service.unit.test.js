describe("chat.service (unit)", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("createMessage rejects non-admin senders", async () => {
    const UserMock = {
      findById: jest.fn().mockResolvedValue({
        _id: "u1",
        role: "user",
        displayName: "Normal User",
      }),
    };
    const ChatMock = {
      create: jest.fn(),
      find: jest.fn(),
    };

    jest.doMock("../../../../src/models/user.model", () => UserMock);
    jest.doMock(
      "../../../../src/models/admin-chat-message.model",
      () => ChatMock
    );

    const service = require("../../../../src/services/chat.service");

    await expect(
      service.createMessage({
        senderUserId: "u1",
        message: "Hello",
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Only admins can use admin chat.",
    });
  });

  test("listMessages applies limit and returns chronological order", async () => {
    const rows = [{ message: "newer" }, { message: "older" }];
    const chain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(rows),
      lean: jest.fn().mockResolvedValue(rows),
    };
    // the service calls .sort().limit().lean()
    chain.sort.mockReturnValue({
      limit: chain.limit,
    });
    chain.limit.mockReturnValue({
      lean: chain.lean,
    });

    const UserMock = { findById: jest.fn() };
    const ChatMock = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue(chain),
    };

    jest.doMock("../../../../src/models/user.model", () => UserMock);
    jest.doMock(
      "../../../../src/models/admin-chat-message.model",
      () => ChatMock
    );

    const service = require("../../../../src/services/chat.service");
    const output = await service.listMessages({ limit: "2" });

    expect(ChatMock.find).toHaveBeenCalledTimes(1);
    expect(Array.isArray(output)).toBe(true);
    expect(output).toEqual(rows.slice().reverse());
  });
});
