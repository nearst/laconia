module.exports = body => {
  return typeof body === "object"
    ? "application/json; charset=utf-8"
    : "text/plain";
};
