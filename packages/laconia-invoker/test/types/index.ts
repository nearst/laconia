import laconia from "@laconia/core";
import invoker, { Invoker } from "../../src/index";

const app = async (
  input: number,
  { captureCardPaymentLambda }: { captureCardPaymentLambda: Invoker }
) => {
  await captureCardPaymentLambda.requestResponse();
  await captureCardPaymentLambda.requestResponse("bar");
  await captureCardPaymentLambda.requestResponse({ foo: "bar" });
  await captureCardPaymentLambda.fireAndForget();
  await captureCardPaymentLambda.fireAndForget("bar");
  await captureCardPaymentLambda.fireAndForget({ foo: "bar" });
};

exports.handler = laconia(app).register(invoker.envVarInstances());
