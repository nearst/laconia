const ApiGatewayOutputConverter = require("../src/ApiGatewayOutputConverter");
const jestResponseMatchers = require("@laconia/event/test/apigateway/jestResponseMatchers");

expect.extend(jestResponseMatchers);

describe("ApiGatewayOutputConverter", () => {
  let outputConverter;

  beforeEach(() => {
    outputConverter = new ApiGatewayOutputConverter();
  });

  it("returns status code 200 by default", async () => {
    const response = await outputConverter.convert("output");
    expect(response).toHaveStatusCode(200);
  });

  it("returns the status code specified", async () => {
    const response = await new ApiGatewayOutputConverter({
      statusCode: 202
    }).convert("output");
    expect(response).toHaveStatusCode(202);
  });

  it("adds additional headers as per specified", async () => {
    const response = await new ApiGatewayOutputConverter({
      additionalHeaders: {
        "Access-Control-Allow-Origin": "foo",
        "Access-Control-Max-Age": "bar"
      }
    }).convert("output");
    expect(response).toContainHeader("Content-Type", expect.any(String));
    expect(response).toContainHeader("Access-Control-Allow-Origin", "foo");
    expect(response).toContainHeader("Access-Control-Max-Age", "bar");
  });

  it("should set body to the object's JSON string", async () => {
    const response = await outputConverter.convert({ foo: "bar" });
    expect(response).toContainBody('{"foo":"bar"}');
  });
});
