const EnvVarInvokerFactory = require("../src/EnvVarInvokerFactory");
const LambdaInvoker = require("../src/LambdaInvoker");

describe("EnvVarInvokerFactory", () => {
  it("creates simple instance name based on the env var name", async () => {
    const invokeFactory = new EnvVarInvokerFactory({
      LACONIA_INVOKER_GREET: "lambda name"
    });
    const instances = await invokeFactory.makeInstances();
    expect(instances).toHaveProperty("greet");
  });

  it("creates camel cased instance name when env var contains underscore", async () => {
    const invokeFactory = new EnvVarInvokerFactory({
      LACONIA_INVOKER_GREET_HELLO_WORLD: "lambda name"
    });
    const instances = await invokeFactory.makeInstances();
    expect(instances).toHaveProperty("greetHelloWorld");
  });

  it("creates an instance of LambdaInvoker with the env var value", async () => {
    const invokeFactory = new EnvVarInvokerFactory({
      LACONIA_INVOKER_HELLO_WORLD: "lambda name"
    });
    const instances = await invokeFactory.makeInstances();
    const helloWorld = instances.helloWorld;
    expect(helloWorld).toBeInstanceOf(LambdaInvoker);
    expect(helloWorld.functionName).toEqual("lambda name");
  });

  it("creates multiple instances", async () => {
    const invokeFactory = new EnvVarInvokerFactory({
      LACONIA_INVOKER_HELLO_WORLD: "hello world",
      LACONIA_INVOKER_GREET: "greet",
      LACONIA_INVOKER_EXCLAIM: "exclaim"
    });
    const instances = await invokeFactory.makeInstances();
    expect(instances).toHaveProperty("helloWorld");
    expect(instances).toHaveProperty("greet");
    expect(instances).toHaveProperty("exclaim");
    expect(instances.greet.functionName).toEqual("greet");
    expect(instances.helloWorld.functionName).toEqual("hello world");
    expect(instances.exclaim.functionName).toEqual("exclaim");
  });

  it("delegates options to invoke", async () => {
    const invokeFactory = new EnvVarInvokerFactory({
      LACONIA_INVOKER_HELLO_WORLD: "lambda name"
    });
    const lambda = jest.fn();
    const instances = await invokeFactory.makeInstances({ lambda });
    const helloWorld = instances.helloWorld;
    expect(helloWorld.lambda).toBe(lambda);
  });
});
