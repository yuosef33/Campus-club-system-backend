let nodemailer = null;
let hasLoggedMailerWarning = false;
try {
  nodemailer = require("nodemailer");
} catch (error) {
  nodemailer = null;
}

let transporter = null;

const isMailerConfigured = () =>
  Boolean(
    nodemailer &&
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_FROM
  );

const logMailerWarningOnce = (reason) => {
  if (hasLoggedMailerWarning) return;
  hasLoggedMailerWarning = true;
  console.warn(`[auth-service][mailer] ${reason}`);
};

const getTransporter = () => {
  if (!nodemailer) {
    logMailerWarningOnce(
      "nodemailer is not installed; auth emails will fall back to token logging."
    );
    return null;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_FROM) {
    logMailerWarningOnce(
      "SMTP configuration is incomplete (need SMTP_HOST, SMTP_PORT, SMTP_FROM)."
    );
    return null;
  }

  if (transporter) {
    return transporter;
  }

  const config = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  };

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    config.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
  }

  transporter = nodemailer.createTransport(config);

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const tx = getTransporter();
  if (!tx) {
    return false;
  }

  await tx.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });

  return true;
};

module.exports = {
  isMailerConfigured,
  sendEmail,
};
