const crypto = require("crypto");

describe("auth.service (unit)", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = "test";
  });

  test("login returns access token when OTP is disabled", async () => {
    const userDoc = {
      _id: { toString: () => "u1" },
      email: "student240001@bue.edu.eg",
      displayName: "Student",
      passwordHash: "hashed",
      role: "user",
      status: "approved",
      otpEnabled: false,
      emailVerified: true,
      save: jest.fn().mockResolvedValue(undefined),
    };

    const UserMock = { findOne: jest.fn().mockResolvedValue(userDoc) };
    const bcryptMock = { compare: jest.fn().mockResolvedValue(true), hash: jest.fn() };
    const jwtMock = {
      signAccessToken: jest.fn().mockReturnValue("access-token"),
      signOtpToken: jest.fn(),
      verifyOtpToken: jest.fn(),
    };

    jest.doMock("../../../../src/models/user.model", () => UserMock);
    jest.doMock("bcryptjs", () => bcryptMock);
    jest.doMock("../../../../src/utils/jwt", () => jwtMock);
    jest.doMock("../../../../src/utils/cloudinary", () => ({
      deleteCloudinaryImage: jest.fn(),
    }));
    jest.doMock("../../../../src/utils/mailer.util", () => ({
      sendEmail: jest.fn().mockResolvedValue(false),
    }));
    jest.doMock("../../../../src/utils/email.util", () => ({
      matchBueEmail: jest.fn(() => ["", "student", "24"]),
      isValidBueYear: jest.fn(() => true),
    }));

    const service = require("../../../../src/services/auth.service");

    const result = await service.login({
      email: "student240001@bue.edu.eg",
      password: "User@1234",
    });

    expect(result.requiresOtp).toBe(false);
    expect(result.token).toBe("access-token");
    expect(jwtMock.signAccessToken).toHaveBeenCalledTimes(1);
  });

  test("login returns OTP challenge when OTP is enabled", async () => {
    const userDoc = {
      _id: { toString: () => "u2" },
      email: "student240002@bue.edu.eg",
      displayName: "Student 2",
      passwordHash: "hashed",
      role: "user",
      status: "approved",
      otpEnabled: true,
      emailVerified: true,
      save: jest.fn().mockResolvedValue(undefined),
    };

    const UserMock = { findOne: jest.fn().mockResolvedValue(userDoc) };
    const bcryptMock = { compare: jest.fn().mockResolvedValue(true), hash: jest.fn() };
    const jwtMock = {
      signAccessToken: jest.fn(),
      signOtpToken: jest.fn().mockReturnValue("otp-token"),
      verifyOtpToken: jest.fn(),
    };
    const sendEmailMock = jest.fn().mockResolvedValue(true);

    jest.doMock("../../../../src/models/user.model", () => UserMock);
    jest.doMock("bcryptjs", () => bcryptMock);
    jest.doMock("../../../../src/utils/jwt", () => jwtMock);
    jest.doMock("../../../../src/utils/cloudinary", () => ({
      deleteCloudinaryImage: jest.fn(),
    }));
    jest.doMock("../../../../src/utils/mailer.util", () => ({
      sendEmail: sendEmailMock,
    }));
    jest.doMock("../../../../src/utils/email.util", () => ({
      matchBueEmail: jest.fn(() => ["", "student", "24"]),
      isValidBueYear: jest.fn(() => true),
    }));

    const service = require("../../../../src/services/auth.service");

    const result = await service.login({
      email: "student240002@bue.edu.eg",
      password: "User@1234",
    });

    expect(result.requiresOtp).toBe(true);
    expect(result.otpToken).toBe("otp-token");
    expect(result.otpCode).toMatch(/^\d{6}$/);
    expect(userDoc.save).toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "student240002@bue.edu.eg",
      })
    );
  });

  test("verifyLoginOtp issues access token when OTP code is valid", async () => {
    const otpCode = "123456";
    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    const userDoc = {
      _id: { toString: () => "u3" },
      email: "student240003@bue.edu.eg",
      displayName: "Student 3",
      role: "user",
      status: "approved",
      otpEnabled: true,
      otpLoginCodeHash: otpHash,
      otpLoginCodeExpiresAt: new Date(Date.now() + 60 * 1000),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const UserMock = {
      findOne: jest.fn(),
      findById: jest.fn().mockResolvedValue(userDoc),
    };
    const jwtMock = {
      signAccessToken: jest.fn().mockReturnValue("access-token"),
      signOtpToken: jest.fn(),
      verifyOtpToken: jest.fn().mockReturnValue({
        userId: "u3",
        purpose: "login_otp",
      }),
    };

    jest.doMock("../../../../src/models/user.model", () => UserMock);
    jest.doMock("bcryptjs", () => ({ compare: jest.fn(), hash: jest.fn() }));
    jest.doMock("../../../../src/utils/jwt", () => jwtMock);
    jest.doMock("../../../../src/utils/cloudinary", () => ({
      deleteCloudinaryImage: jest.fn(),
    }));
    jest.doMock("../../../../src/utils/mailer.util", () => ({
      sendEmail: jest.fn(),
    }));
    jest.doMock("../../../../src/utils/email.util", () => ({
      matchBueEmail: jest.fn(() => ["", "student", "24"]),
      isValidBueYear: jest.fn(() => true),
    }));

    const service = require("../../../../src/services/auth.service");

    const result = await service.verifyLoginOtp({
      otpToken: "otp-token",
      otpCode,
    });

    expect(result.token).toBe("access-token");
    expect(userDoc.otpLoginCodeHash).toBeNull();
    expect(userDoc.otpLoginCodeExpiresAt).toBeNull();
    expect(userDoc.save).toHaveBeenCalled();
  });
});
