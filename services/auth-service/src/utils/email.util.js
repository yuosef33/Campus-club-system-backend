const matchBueEmail = (email) =>
  /^([a-zA-Z]+)(\d{6})@bue\.edu\.eg$/i.exec(email);

const isValidBueYear = (id) => {
  const yearPart = parseInt(id.slice(0, 2), 10);
  const maxYear = (new Date().getFullYear() + 1) % 100;
  return yearPart >= 10 && yearPart <= maxYear;
};

module.exports = {
  matchBueEmail,
  isValidBueYear,
};
