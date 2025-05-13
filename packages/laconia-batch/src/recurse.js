const { InvokeCommand } = require("@aws-sdk/client-lambda");
const isplainobject = require("lodash.isplainobject");
const _ = { isPlainObject: isplainobject };

module.exports = laconiaContext => async (payload = {}) => {
  if (!_.isPlainObject(payload)) {
    throw new Error("Payload must be an object");
  }

  const { context, event, $lambda } = laconiaContext;
  await $lambda.send(
    new InvokeCommand({
      FunctionName: context.functionName,
      InvocationType: "Event",
      Payload: JSON.stringify(Object.assign({}, event, payload))
    })
  );
};
