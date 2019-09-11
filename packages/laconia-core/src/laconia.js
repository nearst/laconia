const AWS = require("aws-sdk");
const CoreLaconiaContext = require("./CoreLaconiaContext");

const checkFunction = (functionName, argument) => {
  if (typeof argument !== "function")
    throw new TypeError(
      `${functionName}() expects to be passed a function, you passed: ${JSON.stringify(
        argument
      )}`
    );
};

const awsInstances = {
  lambda: new AWS.Lambda(),
  s3: new AWS.S3(),
  ssm: new AWS.SSM(),
  sns: new AWS.SNS(),
  secretsManager: new AWS.SecretsManager()
};

const ARG_TYPE = {
  Array: "factories",
  Function: "fn",
  Object: "options",
  String: "name"
};

const functionToFactory = (name, factory) => {
  if (name && factory) {
    factory = laconiaContext => ({ [name]: factory(laconiaContext) });
  }
  return factory;
};

module.exports = app => {
  checkFunction("laconia", app);
  const laconiaContext = new CoreLaconiaContext();
  laconiaContext.registerBuiltInInstances(awsInstances);

  const laconia = async (event, context) => {
    laconiaContext.registerInstances({ event, context });
    await laconiaContext.refresh();
    return app(event, laconiaContext);
  };

  return Object.assign(laconia, {
    register: (factoryName, factory, options) => {
      const args = [factoryName, factory, options].filter(
        arg => ![null, undefined].includes(arg)
      );
      const expectedTypes = ["string", "function", "object"];
      const {
        fn,
        name,
        factories,
        options: { cache }
      } = args
        .filter(argument => expectedTypes.includes(typeof argument))
        .map(argument => [ARG_TYPE[argument.constructor.name], argument])
        .map(([key, argument]) => ({ [key]: argument }))
        .reduce(Object.assign, {
          factories: [],
          options: {}
        });

      if (!factories.length) factories.push(functionToFactory(name, fn));

      factories.forEach(f => checkFunction("register", { fn: f, args }));
      laconiaContext.registerFactories(factories, cache);

      return laconia;
    },

    postProcessor: postProcessor => {
      checkFunction("postProcessor", postProcessor);
      laconiaContext.registerPostProcessor(postProcessor);
      return laconia;
    }
  });
};
