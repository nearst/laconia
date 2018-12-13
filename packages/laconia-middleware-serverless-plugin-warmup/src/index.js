module.exports = () => {
  return next => {
    return async (event, context, callback) => {
      if (
        context.custom &&
        context.custom.source === "serverless-plugin-warmup"
      )
        return "Lambda is warm!";

      return next(event, context, callback);
    };
  };
};
