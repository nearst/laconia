const coreLaconiaContext = require("./coreLaconiaContext");

module.exports = fn => async (event, context, callback) => {
  const laconiaContext = coreLaconiaContext({ event, context });
  try {
    const result = await fn(laconiaContext);
    callback(null, result);
  } catch (err) {
    callback(err);
  }
};
