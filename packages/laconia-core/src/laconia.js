const isfunction = require("lodash.isfunction");
const _ = { isFunction: isfunction };

module.exports = fn => async (event, context, callback) => {
  const laconiaContext = { event, context };
  try {
    const result = await fn(laconiaContext);
    if (_.isFunction(result)) {
      const functionResult = await result(laconiaContext);
      callback(null, functionResult);
    } else {
      callback(null, result);
    }
  } catch (err) {
    callback(err);
  }
};
