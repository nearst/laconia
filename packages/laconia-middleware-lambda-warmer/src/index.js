const warmer = require("lambda-warmer");

module.exports = () => {
  return next => {
    return async (event, context, callback) => {
      if (await warmer(event)) return "warmed";

      return next(event, context, callback);
    };
  };
};
