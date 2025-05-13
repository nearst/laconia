const { InvokeCommand } = require("@aws-sdk/client-lambda");

module.exports = laconiaContext => async payload => {
  if (payload && typeof payload !== "object") {
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
