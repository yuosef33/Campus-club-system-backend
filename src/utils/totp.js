const crypto = require("crypto");

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const OTP_PERIOD_SECONDS = 30;
const OTP_DIGITS = 6;

const generateBase32Secret = (size = 20) => {
  const randomBytes = crypto.randomBytes(size);
  let bits = "";

  for (const byte of randomBytes) {
    bits += byte.toString(2).padStart(8, "0");
  }

  let output = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    output += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }

  return output;
};

const base32ToBuffer = (input) => {
  const normalized = String(input || "")
    .toUpperCase()
    .replace(/=+$/g, "")
    .replace(/\s+/g, "");

  if (!normalized) {
    return Buffer.alloc(0);
  }

  let bits = "";
  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error("Invalid base32 secret.");
    }
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
};

const generateCounterBuffer = (counter) => {
  const buffer = Buffer.alloc(8);
  let remaining = BigInt(counter);
  for (let i = 7; i >= 0; i -= 1) {
    buffer[i] = Number(remaining & BigInt(0xff));
    remaining >>= BigInt(8);
  }
  return buffer;
};

const generateTotpCode = ({
  secret,
  timestamp = Date.now(),
  period = OTP_PERIOD_SECONDS,
  digits = OTP_DIGITS,
}) => {
  const key = base32ToBuffer(secret);
  const counter = Math.floor(timestamp / 1000 / period);
  const counterBuffer = generateCounterBuffer(counter);
  const hmac = crypto.createHmac("sha1", key).update(counterBuffer).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binaryCode % 10 ** digits;
  return String(otp).padStart(digits, "0");
};

const verifyTotpCode = ({
  secret,
  token,
  timestamp = Date.now(),
  period = OTP_PERIOD_SECONDS,
  digits = OTP_DIGITS,
  window = 1,
}) => {
  const normalizedToken = String(token || "").trim();
  if (!/^\d{6}$/.test(normalizedToken)) {
    return false;
  }

  for (let drift = -window; drift <= window; drift += 1) {
    const stepTimestamp = timestamp + drift * period * 1000;
    const generated = generateTotpCode({
      secret,
      timestamp: stepTimestamp,
      period,
      digits,
    });

    if (generated === normalizedToken) {
      return true;
    }
  }

  return false;
};

const buildOtpAuthUrl = ({ secret, accountName, issuer = "CampusClub" }) => {
  const label = `${issuer}:${accountName}`;
  const encodedLabel = encodeURIComponent(label);
  const encodedIssuer = encodeURIComponent(issuer);

  return `otpauth://totp/${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${OTP_DIGITS}&period=${OTP_PERIOD_SECONDS}`;
};

module.exports = {
  generateBase32Secret,
  generateTotpCode,
  verifyTotpCode,
  buildOtpAuthUrl,
};
