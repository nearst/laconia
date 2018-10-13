const invoker = require("@laconia/invoker");
const isplainobject = require("lodash.isplainobject");
const _ = { isPlainObject: isplainobject };

module.exports = ({ event, context, $lambda }) => (payload = {}) => {
  if (!_.isPlainObject(payload)) {
    throw new Error("Payload must be an object");
  }
  return invoker(context.functionName, $lambda).fireAndForget(
    Object.assign({}, event, payload)
  );
};
