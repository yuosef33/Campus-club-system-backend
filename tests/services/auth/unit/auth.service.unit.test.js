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
    jest.doMock("../../../../src/utils/totp", () => ({
      generateBase32Secret: jest.fn().mockReturnValue("OTPSECRET"),
      verifyTotpCode: jest.fn().mockReturnValue(true),
      buildOtpAuthUrl: jest.fn().mockReturnValue("otpauth://totp/test"),
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

  test("login returns authenticator OTP challenge when OTP is enabled", async () => {
    const userDoc = {
      _id: { toString: () => "u2" },
      email: "student240002@bue.edu.eg",
      displayName: "Student 2",
      passwordHash: "hashed",
      role: "user",
      status: "approved",
      otpEnabled: true,
      otpSecret: "OTPSECRET",
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

    jest.doMock("../../../../src/models/user.model", () => UserMock);
    jest.doMock("bcryptjs", () => bcryptMock);
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
    jest.doMock("../../../../src/utils/totp", () => ({
      generateBase32Secret: jest.fn().mockReturnValue("OTPSECRET"),
      verifyTotpCode: jest.fn().mockReturnValue(true),
      buildOtpAuthUrl: jest.fn().mockReturnValue("otpauth://totp/test"),
    }));

    const service = require("../../../../src/services/auth.service");

    const result = await service.login({
      email: "student240002@bue.edu.eg",
      password: "User@1234",
    });

    expect(result.requiresOtp).toBe(true);
    expect(result.otpToken).toBe("otp-token");
    expect(jwtMock.signOtpToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u2",
        purpose: "login_otp",
      })
    );
  });

  test("verifyLoginOtp issues access token when authenticator code is valid", async () => {
    const userDoc = {
      _id: { toString: () => "u3" },
      email: "student240003@bue.edu.eg",
      displayName: "Student 3",
      role: "user",
      status: "approved",
      otpEnabled: true,
      otpSecret: "OTPSECRET",
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
    const verifyTotpCodeMock = jest.fn().mockReturnValue(true);

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
    jest.doMock("../../../../src/utils/totp", () => ({
      generateBase32Secret: jest.fn().mockReturnValue("OTPSECRET"),
      verifyTotpCode: verifyTotpCodeMock,
      buildOtpAuthUrl: jest.fn().mockReturnValue("otpauth://totp/test"),
    }));

    const service = require("../../../../src/services/auth.service");

    const result = await service.verifyLoginOtp({
      otpToken: "otp-token",
      otpCode: "123456",
    });

    expect(result.token).toBe("access-token");
    expect(verifyTotpCodeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        secret: "OTPSECRET",
        token: "123456",
      })
    );
  });
});
