const Emittery = require("emittery");
const coreLaconiaContext = require("./coreLaconiaContext");

module.exports = fn => {
  const emitter = new Emittery();
  const laconia = async (event, context, callback) => {
    const laconiaContext = coreLaconiaContext({ event, context });
    await emitter.emit("init", laconiaContext);

    try {
      const result = await fn(laconiaContext);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  };

  return Object.assign(laconia, {
    run: laconiaContext => fn(laconiaContext),
    on: (eventName, listener) => {
      emitter.on(eventName, listener);
      return laconia;
    }
  });
};
