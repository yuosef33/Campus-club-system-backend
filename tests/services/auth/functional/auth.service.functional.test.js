const bcrypt = require("bcryptjs");
const {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase,
  runIfDatabaseAvailable,
  logSkipIfDatabaseUnavailable,
} = require("../../../helpers/test-db");
const authService = require("../../../../src/services/auth.service");
const User = require("../../../../src/models/user.model");
const { USER_STATUS } = require("../../../../src/constants/roles");

describe("auth.service (functional)", () => {
  beforeAll(async () => {
    const connected = await connectTestDatabase();
    if (!connected) {
      logSkipIfDatabaseUnavailable();
    }
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  runIfDatabaseAvailable(
    "register creates user with OTP disabled by default",
    async () => {
    const result = await authService.register({
      displayName: "Student One",
      email: "student240001@bue.edu.eg",
      password: "User@1234",
      phoneNumber: "+201000000001",
    });

    expect(result.user.otpEnabled).toBe(false);
    expect(result.user.status).toBe(USER_STATUS.PENDING);
    expect(result.user.email).toBe("student240001@bue.edu.eg");
    }
  );

  runIfDatabaseAvailable(
    "supports optional OTP login flow after enabling OTP",
    async () => {
    const password = "User@1234";
    const user = await User.create({
      displayName: "Student Two",
      email: "student240002@bue.edu.eg",
      passwordHash: await bcrypt.hash(password, 10),
      role: "user",
      status: "approved",
      emailVerified: true,
      otpEnabled: false,
    });

    const loginWithoutOtp = await authService.login({
      email: user.email,
      password,
    });
    expect(loginWithoutOtp.requiresOtp).toBe(false);
    expect(typeof loginWithoutOtp.token).toBe("string");

    const updatedUser = await authService.updateOtpSettings(user._id, {
      enabled: true,
    });
    expect(updatedUser.otpEnabled).toBe(true);

    const otpChallenge = await authService.login({
      email: user.email,
      password,
    });
    expect(otpChallenge.requiresOtp).toBe(true);
    expect(otpChallenge.otpToken).toBeTruthy();
    expect(otpChallenge.otpCode).toMatch(/^\d{6}$/);

    const verified = await authService.verifyLoginOtp({
      otpToken: otpChallenge.otpToken,
      otpCode: otpChallenge.otpCode,
    });
    expect(typeof verified.token).toBe("string");
    expect(verified.user._id.toString()).toBe(user._id.toString());
    }
  );
});
