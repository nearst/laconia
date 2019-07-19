import laconia from "@laconia/core";
import adapter from "../../src/index";

interface Dependencies {
  someKey: string;
}
interface Application {
  (input: number, dependencies: Dependencies): Promise<string>;
}

const s3 = adapter.s3();
const app: Application = async (input: number, { someKey }: Dependencies) => {
  return input + someKey;
};

laconia(s3(app));

adapter.s3({ inputType: "stream" });
adapter.s3({ inputType: "object" });

const sns = adapter.sns();
laconia(sns(app));

interface ArrayApplication {
  (input: number[], dependencies: Dependencies): Promise<string>;
}

const arrayApp: ArrayApplication = async (
  input: number[],
  { someKey }: Dependencies
) => {
  return input + someKey;
};

const kinesis = adapter.kinesis();
laconia(kinesis(arrayApp));

const sqs = adapter.sqs();
laconia(sqs(arrayApp));
