const invoke = require("./invoke");
const handler = require("./handler");
const isplainobject = require("lodash.isplainobject");
const _ = { isPlainObject: isplainobject };

module.exports = fn =>
  handler(laconiaContext => {
    const { event, context } = laconiaContext;
    const recurse = (payload = {}) => {
      if (!_.isPlainObject(payload)) {
        throw new Error("Payload must be an object");
      }
      return invoke(context.functionName).fireAndForget(
        Object.assign({}, event, payload)
      );
    };
    return fn(laconiaContext, recurse);
  });
