const mongoose = require("mongoose");
const { ROLES, USER_STATUS } = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: 25,
      default: null,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    otpEnabled: {
      type: Boolean,
      default: false,
    },
    otpSecret: {
      type: String,
      default: null,
    },
    emailVerificationTokenHash: {
      type: String,
      default: null,
    },
    emailVerificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
      default: null,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    profileImagePublicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.passwordHash;
    delete ret.otpSecret;
    delete ret.emailVerificationTokenHash;
    delete ret.passwordResetTokenHash;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
