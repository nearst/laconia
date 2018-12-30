const ApiGatewayMergedInputConverter = require("../src/ApiGatewayMergedInputConverter");
const createEvent = require("aws-event-mocks");

const createApiGatewayEvent = ({
  body,
  pathParameters = {},
  queryStringParameters = {},
  headers = {}
}) =>
  createEvent({
    template: "aws:apiGateway",
    merge: {
      body: JSON.stringify(body),
      pathParameters: {
        proxy: "hello"
      },
      queryStringParameters: {
        q: "input"
      },
      headers: {
        Authorization: "secret"
      }
    }
  });

describe("ApiGatewayMergedInputConverter", () => {
  it("should convert JSON body into object", async () => {
    const event = createApiGatewayEvent({ body: { foo: "bar" } });
    const inputConverter = new ApiGatewayMergedInputConverter();
    const input = await inputConverter.convert(event);
    expect(input).toEqual({ foo: "bar" });
  });
});
