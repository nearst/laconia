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

apigateway({
  responseStatusCode: 202,
  errorMappings: {
    "Validation.*": error => ({
      body: { foo: error.message },
      headers: { "Access-Control-Max-Age": 123 },
      statusCode: 400
    }),
    ".*Error": () => ({ statusCode: 500 })
  }
});

const errorMappings = new Map();
errorMappings.set("Validation.*", () => ({ statusCode: 400 }));
errorMappings.set(".*Error", () => ({ "Access-Control-Max-Age": 123 }));

apigateway({ errorMappings });
apigateway({
  errorMappings: new Map([
    ["Validation.*", () => ({ statusCode: 400 })],
    [".*Error", () => ({ statusCode: 500 })]
  ])
});

apigateway({
  inputType: "body",
  responseAdditionalHeaders: {
    "Access-Control-Allow-Origin": "foo"
  }
});
