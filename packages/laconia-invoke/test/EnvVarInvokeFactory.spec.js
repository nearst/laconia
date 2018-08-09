const EnvVarInvokeFactory = require("../src/EnvVarInvokeFactory");
const LambdaInvoker = require("../src/LambdaInvoker");

describe("EnvVarInvokeFactory", () => {
  it("creates simple instance name based on the env var name", () => {
    const invokeFactory = new EnvVarInvokeFactory({
      LACONIA_INVOKE_GREET: "lambda name"
    });
    const instances = invokeFactory.makeInstances();
    expect(instances).toHaveProperty("greet");
  });

  it("creates camel cased instance name when env var contains underscore", () => {
    const invokeFactory = new EnvVarInvokeFactory({
      LACONIA_INVOKE_GREET_HELLO_WORLD: "lambda name"
    });
    const instances = invokeFactory.makeInstances();
    expect(instances).toHaveProperty("greetHelloWorld");
  });

  it("creates an instance of LambdaInvoker with the env var value", () => {
    const invokeFactory = new EnvVarInvokeFactory({
      LACONIA_INVOKE_HELLO_WORLD: "lambda name"
    });
    const instances = invokeFactory.makeInstances();
    const helloWorld = instances.helloWorld;
    expect(helloWorld).toBeInstanceOf(LambdaInvoker);
    expect(helloWorld.functionName).toEqual("lambda name");
  });

  it("creates multiple instances", () => {
    const invokeFactory = new EnvVarInvokeFactory({
      LACONIA_INVOKE_HELLO_WORLD: "hello world",
      LACONIA_INVOKE_GREET: "greet",
      LACONIA_INVOKE_EXCLAIM: "exclaim"
    });
    const instances = invokeFactory.makeInstances();
    expect(instances).toHaveProperty("helloWorld");
    expect(instances).toHaveProperty("greet");
    expect(instances).toHaveProperty("exclaim");
    expect(instances.greet.functionName).toEqual("greet");
    expect(instances.helloWorld.functionName).toEqual("hello world");
    expect(instances.exclaim.functionName).toEqual("exclaim");
  });

  xit("delegates options to invoke", () => {});
});
