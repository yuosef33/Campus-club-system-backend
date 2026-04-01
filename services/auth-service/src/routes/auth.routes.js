const express = require("express");
const multer = require("multer");
const authController = require("../controllers/auth.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../../../../shared/middlewares/auth");
const { requireInternalServiceKey } = require("../../../../shared/middlewares/internalAuth");
const { uploadImage } = require("../../../../shared/utils/multer");
const {
  validateRegister,
  validateLogin,
  validateEmailVerificationRequest,
  validateEmailVerificationConfirm,
  validateEmailVerificationConfirmQuery,
  validateForgotPassword,
  validateResetPassword,
  validateProfileUpdate,
  validatePasswordUpdate,
  validateAdminUserFilters,
  validateUserIdParam,
  validateInternalBatch,
} = require("../validators/auth.validator");
const { ROLES } = require("../../../../shared/constants/roles");

const router = express.Router();
const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/auth/register", validateRegister, authController.register);
router.post("/auth/login", validateLogin, authController.login);
router.post(
  "/auth/verify-email/request",
  validateEmailVerificationRequest,
  authController.requestEmailVerification
);
router.post(
  "/auth/forgot-password",
  validateForgotPassword,
  authController.forgotPassword
);
router.post(
  "/auth/reset-password",
  validateResetPassword,
  authController.resetPassword
);
router.post(
  "/auth/verify-email/confirm",
  validateEmailVerificationConfirm,
  authController.verifyEmail
);
router.get(
  "/auth/verify-email/confirm",
  validateEmailVerificationConfirmQuery,
  authController.verifyEmailFromQuery
);

router.get("/users/me", authenticate, authController.getMyProfile);
router.put("/users/me", authenticate, validateProfileUpdate, authController.updateMyProfile);
router.put(
  "/users/me/password",
  authenticate,
  validatePasswordUpdate,
  authController.updateMyPassword
);
router.put(
  "/users/me/profile-image",
  authenticate,
  uploadImage.single("image"),
  authController.updateMyProfileImage
);

router.get(
  "/admin/users",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateAdminUserFilters,
  authController.listUsers
);
router.patch(
  "/admin/users/:id/approve",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateUserIdParam,
  authController.approveUser
);
router.patch(
  "/admin/users/:id/reject",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validateUserIdParam,
  authController.rejectUser
);
router.post(
  "/admin/users/import-csv",
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  uploadCsv.single("file"),
  authController.importMembersCsv
);

router.get(
  "/internal/users/:id",
  requireInternalServiceKey,
  validateUserIdParam,
  authController.getInternalUserById
);
router.post(
  "/internal/users/batch",
  requireInternalServiceKey,
  validateInternalBatch,
  authController.getInternalUsersBatch
);

module.exports = router;
