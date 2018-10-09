const AWSXRay = require("aws-xray-sdk-core");

const collectPrototypeNames = (obj, prototypes) => {
  const prototype = Object.getPrototypeOf(obj);
  if (prototype === null) {
    return;
  }
  prototypes.push(prototype.constructor.name);
  collectPrototypeNames(prototype, prototypes);
};

const getPrototypeNames = obj => {
  const prototypes = [];
  collectPrototypeNames(obj, prototypes);
  return prototypes;
};

/**
 * `instanceof` operator could not be used as there are multiple occurrences of
 * aws-sdk in runtime. One is the one that is provided by AWS Lambda,
 * another is the one that is dependent on by aws-xray-sdk-core.
 *
 * See: https://github.com/aws/aws-xray-sdk-node/pull/55
 */
const isAwsService = obj => {
  return obj.serviceIdentifier && getPrototypeNames(obj).includes("Service");
};

module.exports = lc => {
  Object.values(lc).forEach(instance => {
    if (isAwsService(instance)) {
      AWSXRay.captureAWSClient(instance);
    }
  });
};
