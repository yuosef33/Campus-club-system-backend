const ApiError = require("../../../../shared/utils/ApiError");

const splitCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseMembersCsvBuffer = (buffer) => {
  const text = buffer.toString("utf8").replace(/^\uFEFF/, "").trim();
  if (!text) {
    throw new ApiError(400, "CSV file is empty.");
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new ApiError(400, "CSV must contain a header row and at least one data row.");
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase().trim());
  const emailIndex = headers.indexOf("email");
  const displayNameIndex = ["displayname", "display_name", "name", "full_name"]
    .map((key) => headers.indexOf(key))
    .find((index) => index >= 0);

  if (emailIndex < 0 || displayNameIndex === undefined) {
    throw new ApiError(
      400,
      "CSV headers must include 'email' and one of: displayName, display_name, name, full_name."
    );
  }

  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const rowValues = splitCsvLine(lines[i]);
    const email = (rowValues[emailIndex] || "").trim().toLowerCase();
    const displayName = (rowValues[displayNameIndex] || "").trim();

    if (!email && !displayName) {
      continue;
    }

    rows.push({
      rowNumber: i + 1,
      displayName,
      email,
    });
  }

  return rows;
};

module.exports = {
  parseMembersCsvBuffer,
};
