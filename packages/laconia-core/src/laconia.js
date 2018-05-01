const EventEmitter = require("events");
const coreLaconiaContext = require("./coreLaconiaContext");

module.exports = fn => {
  const laconia = async (event, context, callback) => {
    const laconiaContext = coreLaconiaContext({ event, context });
    laconia.emit("init", laconiaContext);
    try {
      const result = await fn(laconiaContext);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  };
  laconia.run = laconiaContext => fn(laconiaContext);
  return Object.assign(laconia, EventEmitter.prototype);
};
