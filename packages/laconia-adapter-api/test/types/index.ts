import { apigateway } from "../../src/index";
import laconia from "@laconia/core";

interface Dependencies {
  someKey: string;
}
interface Application {
  (input: number, dependencies: Dependencies): Promise<string>;
}

const api = apigateway({
  inputType: "params"
});
const app: Application = async (input: number, { someKey }: Dependencies) => {
  return input + someKey;
};

laconia(api(app));
