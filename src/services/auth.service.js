const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const { signAccessToken } = require("../utils/jwt");
const { ROLES, USER_STATUS } = require("../constants/roles");
const {
  deleteCloudinaryImage,
} = require("../utils/cloudinary");
const { sendEmail } = require("../utils/mailer.util");
const { matchBueEmail, isValidBueYear } = require("../utils/email.util");

const SALT_ROUNDS = 10;
const EMAIL_VERIFICATION_TOKEN_TTL_MINUTES = Number(
  process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES || 60 * 24
);
const PASSWORD_RESET_TOKEN_TTL_MINUTES = Number(
  process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 60
);

const buildTokenPayload = (user) => ({
  userId: user._id.toString(),
  email: user.email,
  displayName: user.displayName,
  role: user.role,
  status: user.status,
});

const hashVerificationToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const buildVerificationLink = (token) => {
  const explicitBaseUrl = process.env.FRONTEND_VERIFY_EMAIL_URL;
  if (explicitBaseUrl) {
    const separator = explicitBaseUrl.includes("?") ? "&" : "?";
    return `${explicitBaseUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  const fallbackBase = process.env.API_PUBLIC_BASE_URL || "http://localhost:4000/api/v1";
  return `${fallbackBase}/auth/verify-email/confirm?token=${encodeURIComponent(token)}`;
};

const buildResetPasswordLink = (token) => {
  const explicitBaseUrl = process.env.FRONTEND_RESET_PASSWORD_URL;
  if (explicitBaseUrl) {
    const separator = explicitBaseUrl.includes("?") ? "&" : "?";
    return `${explicitBaseUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  const fallbackBase = process.env.API_PUBLIC_BASE_URL || "http://localhost:4000/api/v1";
  return `${fallbackBase}/auth/reset-password?token=${encodeURIComponent(token)}`;
};

const createVerificationTokenPayload = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(
    Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MINUTES * 60 * 1000
  );

  return {
    token,
    tokenHash,
    expiresAt,
  };
};

const createPasswordResetTokenPayload = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000
  );

  return {
    token,
    tokenHash,
    expiresAt,
  };
};

const isValidBueEmail = (email) => {
  const match = matchBueEmail(email);
  if (!match) {
    return false;
  }
  return isValidBueYear(match[2]);
};

const sanitizeUser = (userDoc) => ({
  _id: userDoc._id,
  displayName: userDoc.displayName,
  email: userDoc.email,
  role: userDoc.role,
  status: userDoc.status,
  emailVerified: Boolean(userDoc.emailVerified),
  emailVerifiedAt: userDoc.emailVerifiedAt || null,
  profileImageUrl: userDoc.profileImageUrl,
  createdAt: userDoc.createdAt,
  updatedAt: userDoc.updatedAt,
});

const issueEmailVerification = async (user) => {
  if (user.emailVerified) {
    return {
      sent: false,
      alreadyVerified: true,
      verificationExpiresAt: null,
    };
  }

  const { token, tokenHash, expiresAt } = createVerificationTokenPayload();
  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationTokenExpiresAt = expiresAt;
  await user.save();

  const verificationLink = buildVerificationLink(token);
  const subject = "Verify your Campus Club account email";
  const text = `Please verify your email using this link: ${verificationLink}`;
  const html = `<p>Please verify your email using this link:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`;

  let sent = false;
  try {
    sent = await sendEmail({
      to: user.email,
      subject,
      text,
      html,
    });
  } catch (error) {
    sent = false;
    console.error("[auth-service] failed to send verification email:", error.message);
  }

  if (!sent) {
    console.log(
      `[auth-service] verification token for ${user.email}: ${token} (expires ${expiresAt.toISOString()})`
    );
  }

  return {
    sent,
    alreadyVerified: false,
    verificationExpiresAt: expiresAt,
    verificationToken:
      process.env.NODE_ENV === "production" ? undefined : token,
    verificationLink:
      process.env.NODE_ENV === "production" ? undefined : verificationLink,
  };
};

const issuePasswordReset = async (user) => {
  const { token, tokenHash, expiresAt } = createPasswordResetTokenPayload();
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetTokenExpiresAt = expiresAt;
  await user.save();

  const resetLink = buildResetPasswordLink(token);
  const subject = "Reset your Campus Club account password";
  const text = `Reset your password using this link: ${resetLink}`;
  const html = `<p>Reset your password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p>`;

  let sent = false;
  try {
    sent = await sendEmail({
      to: user.email,
      subject,
      text,
      html,
    });
  } catch (error) {
    sent = false;
    console.error("[auth-service] failed to send password reset email:", error.message);
  }

  if (!sent) {
    console.log(
      `[auth-service] password reset token for ${user.email}: ${token} (expires ${expiresAt.toISOString()})`
    );
  }

  return {
    sent,
    resetExpiresAt: expiresAt,
    resetToken: process.env.NODE_ENV === "production" ? undefined : token,
    resetLink: process.env.NODE_ENV === "production" ? undefined : resetLink,
  };
};

const register = async ({ displayName, email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, "Email is already registered.");
  }

  if (!isValidBueEmail(normalizedEmail)) {
    throw new ApiError(400, "Invalid BUE email format or invalid student ID year.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    displayName: displayName.trim(),
    email: normalizedEmail,
    passwordHash,
    role: ROLES.USER,
    status: USER_STATUS.PENDING,
  });

  const emailVerification = await issueEmailVerification(user);

  return {
    user: sanitizeUser(user),
    emailVerification,
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.status !== USER_STATUS.APPROVED) {
    if (user.status === USER_STATUS.PENDING) {
      throw new ApiError(
        403,
        "Your registration is pending admin approval."
      );
    }
    throw new ApiError(403, "Your account has been rejected by the admin.");
  }

  const token = signAccessToken(buildTokenPayload(user));

  return {
    token,
    user: sanitizeUser(user),
  };
};

const requestEmailVerification = async ({ email }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return {
      sent: false,
      alreadyVerified: false,
    };
  }

  return issueEmailVerification(user);
};

const verifyEmail = async ({ token }) => {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    throw new ApiError(400, "Verification token is required.");
  }

  const tokenHash = hashVerificationToken(normalizedToken);
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token.");
  }

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = null;
  user.emailVerificationTokenExpiresAt = null;
  await user.save();

  return sanitizeUser(user);
};

const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return {
      sent: false,
    };
  }

  return issuePasswordReset(user);
};

const resetPassword = async ({ token, newPassword }) => {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    throw new ApiError(400, "Password reset token is required.");
  }

  const tokenHash = hashVerificationToken(normalizedToken);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token.");
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiresAt = null;
  await user.save();
};

const buildImportedMemberPassword = () => {
  const random = crypto.randomBytes(8).toString("hex");
  return `Imp@${random}1A`;
};

const importApprovedVerifiedMembers = async (members) => {
  const summary = {
    totalRows: members.length,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: [],
  };

  for (const member of members) {
    const email = String(member.email || "").trim().toLowerCase();
    const displayName = String(member.displayName || "").trim();

    if (!email || !displayName) {
      summary.failed.push({
        rowNumber: member.rowNumber,
        email,
        reason: "displayName and email are required.",
      });
      continue;
    }

    if (!isValidBueEmail(email)) {
      summary.failed.push({
        rowNumber: member.rowNumber,
        email,
        reason: "Invalid BUE email format or invalid student ID year.",
      });
      continue;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === ROLES.ADMIN) {
        summary.skipped += 1;
        continue;
      }

      existingUser.displayName = displayName;
      existingUser.role = ROLES.USER;
      existingUser.status = USER_STATUS.APPROVED;
      existingUser.emailVerified = true;
      existingUser.emailVerifiedAt = existingUser.emailVerifiedAt || new Date();
      existingUser.emailVerificationTokenHash = null;
      existingUser.emailVerificationTokenExpiresAt = null;
      existingUser.passwordResetTokenHash = null;
      existingUser.passwordResetTokenExpiresAt = null;
      await existingUser.save();
      summary.updated += 1;
      continue;
    }

    const passwordHash = await bcrypt.hash(buildImportedMemberPassword(), SALT_ROUNDS);
    await User.create({
      displayName,
      email,
      passwordHash,
      role: ROLES.USER,
      status: USER_STATUS.APPROVED,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    summary.created += 1;
  }

  return summary;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  return sanitizeUser(user);
};

const updateProfile = async (userId, { displayName }) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { displayName: displayName.trim() },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return sanitizeUser(user);
};

const updatePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiresAt = null;
  await user.save();
};

const updateProfileImage = async (userId, imagePayload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.profileImagePublicId && user.profileImagePublicId !== imagePayload.publicId) {
    await deleteCloudinaryImage(user.profileImagePublicId);
  }

  user.profileImageUrl = imagePayload.imageUrl;
  user.profileImagePublicId = imagePayload.publicId || null;
  await user.save();

  return sanitizeUser(user);
};

const listUsers = async ({ status, role }) => {
  const query = {
    role: { $ne: ROLES.ADMIN },
  };
  if (status) {
    query.status = status;
  }
  if (role) {
    query.role = role;
  }

  const users = await User.find(query).sort({ createdAt: -1 });
  return users.map(sanitizeUser);
};

const updateUserStatus = async (userId, status) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.status = status;
  await user.save();

  return sanitizeUser(user);
};

const promoteUserToAdmin = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.role === ROLES.ADMIN) {
    throw new ApiError(409, "User is already an admin.");
  }

  user.role = ROLES.ADMIN;
  user.status = USER_STATUS.APPROVED;
  await user.save();

  return sanitizeUser(user);
};

const getUsersByIds = async (userIds) => {
  const users = await User.find({ _id: { $in: userIds } });
  return users.map((user) => ({
    _id: user._id.toString(),
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: Boolean(user.emailVerified),
    emailVerifiedAt: user.emailVerifiedAt || null,
    profileImageUrl: user.profileImageUrl,
  }));
};

const ensureDefaultAdmin = async () => {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  const adminName = process.env.DEFAULT_ADMIN_NAME || "Club Admin";

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
  await User.create({
    displayName: adminName,
    email: adminEmail.toLowerCase(),
    passwordHash,
    role: ROLES.ADMIN,
    status: USER_STATUS.APPROVED,
    emailVerified: true,
    emailVerifiedAt: new Date(),
  });

  console.log("[auth-service] default admin account created.");
};

module.exports = {
  register,
  login,
  requestEmailVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  importApprovedVerifiedMembers,
  getUserById,
  updateProfile,
  updatePassword,
  updateProfileImage,
  listUsers,
  updateUserStatus,
  promoteUserToAdmin,
  getUsersByIds,
  ensureDefaultAdmin,
};
