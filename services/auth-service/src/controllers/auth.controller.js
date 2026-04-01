const asyncHandler = require("../../../../shared/utils/asyncHandler");
const ApiError = require("../../../../shared/utils/ApiError");
const authService = require("../services/auth.service");
const { USER_STATUS } = require("../../../../shared/constants/roles");
const {
  uploadImageBuffer,
  isCloudinaryConfigured,
} = require("../../../../shared/utils/cloudinary");
const { parseMembersCsvBuffer } = require("../utils/csv.util");

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message:
      "Registration submitted. Awaiting admin approval. Verify email to help admin identify verified accounts.",
    data: result.user,
    meta: {
      emailVerificationSent: Boolean(result.emailVerification?.sent),
      emailVerificationExpiresAt:
        result.emailVerification?.verificationExpiresAt || null,
      ...(result.emailVerification?.verificationToken
        ? {
            verificationToken: result.emailVerification.verificationToken,
            verificationLink: result.emailVerification.verificationLink,
          }
        : {}),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: payload,
  });
});

const requestEmailVerification = asyncHandler(async (req, res) => {
  const result = await authService.requestEmailVerification(req.body);
  res.status(200).json({
    success: true,
    message:
      "If this email exists, a verification email has been sent. Verification is independent from admin approval.",
    meta: {
      emailVerificationSent: Boolean(result.sent),
      emailVerificationExpiresAt: result.verificationExpiresAt || null,
      ...(result.verificationToken
        ? {
            verificationToken: result.verificationToken,
            verificationLink: result.verificationLink,
          }
        : {}),
    },
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body);
  res.status(200).json({
    success: true,
    message: "If this email exists, a password reset email has been sent.",
    meta: {
      resetPasswordEmailSent: Boolean(result.sent),
      resetPasswordExpiresAt: result.resetExpiresAt || null,
      ...(result.resetToken
        ? {
            resetToken: result.resetToken,
            resetLink: result.resetLink,
          }
        : {}),
    },
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.status(200).json({
    success: true,
    message: "Password reset successfully.",
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body);
  res.status(200).json({
    success: true,
    message:
      "Email verified successfully. Account still requires admin approval before member access.",
    data: user,
  });
});

const verifyEmailFromQuery = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail({ token: req.query.token });
  res.status(200).json({
    success: true,
    message:
      "Email verified successfully. Account still requires admin approval before member access.",
    data: user,
  });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.userId);
  res.status(200).json({ success: true, data: user });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.userId, req.body);
  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: user,
  });
});

const updateMyPassword = asyncHandler(async (req, res) => {
  await authService.updatePassword(req.user.userId, req.body);
  res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
});

const updateMyProfileImage = asyncHandler(async (req, res) => {
  let imageUrl = req.body.imageUrl;
  let publicId = null;

  if (req.file) {
    const uploadResult = await uploadImageBuffer(
      req.file.buffer,
      "campus-club/profile-images",
      req.file.mimetype
    );
    imageUrl = uploadResult.secure_url;
    publicId = uploadResult.public_id;
  }

  if (!imageUrl) {
    throw new ApiError(
      400,
      isCloudinaryConfigured()
        ? "Provide imageUrl or upload an image file."
        : "Provide imageUrl. Cloudinary is not configured for file uploads."
    );
  }

  const user = await authService.updateProfileImage(req.user.userId, {
    imageUrl,
    publicId,
  });

  res.status(200).json({
    success: true,
    message: "Profile image updated successfully.",
    data: user,
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await authService.listUsers(req.query);
  res.status(200).json({ success: true, data: users });
});

const approveUser = asyncHandler(async (req, res) => {
  const user = await authService.updateUserStatus(
    req.params.id,
    USER_STATUS.APPROVED
  );
  res.status(200).json({
    success: true,
    message: "User approved successfully.",
    data: user,
  });
});

const rejectUser = asyncHandler(async (req, res) => {
  const user = await authService.updateUserStatus(
    req.params.id,
    USER_STATUS.REJECTED
  );
  res.status(200).json({
    success: true,
    message: "User rejected successfully.",
    data: user,
  });
});

const importMembersCsv = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "CSV file is required.");
  }

  const fileName = req.file.originalname || "";
  const isCsvFileName = fileName.toLowerCase().endsWith(".csv");
  const isCsvMimeType = ["text/csv", "application/vnd.ms-excel", "text/plain"].includes(
    req.file.mimetype
  );

  if (!isCsvFileName && !isCsvMimeType) {
    throw new ApiError(400, "Only CSV files are supported.");
  }

  const members = parseMembersCsvBuffer(req.file.buffer);
  const summary = await authService.importApprovedVerifiedMembers(members);

  res.status(200).json({
    success: true,
    message: "CSV import completed.",
    data: summary,
  });
});

const getInternalUserById = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

const getInternalUsersBatch = asyncHandler(async (req, res) => {
  const userIds = Array.isArray(req.body.userIds) ? req.body.userIds : [];
  const users = await authService.getUsersByIds(userIds);
  res.status(200).json({ success: true, data: users });
});

module.exports = {
  register,
  login,
  requestEmailVerification,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyEmailFromQuery,
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
  updateMyProfileImage,
  listUsers,
  approveUser,
  rejectUser,
  importMembersCsv,
  getInternalUserById,
  getInternalUsersBatch,
};
