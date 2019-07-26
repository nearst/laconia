import laconia from "@laconia/core";
import invoker, { Invoker } from "../../src/index";

const app = async (
  input: number,
  { captureCardPaymentLambda }: { captureCardPaymentLambda: Invoker }
) => {};

exports.handler = laconia(app).register(invoker.envVarInstances());
