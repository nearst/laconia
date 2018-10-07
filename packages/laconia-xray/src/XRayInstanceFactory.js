const AWS = require("aws-sdk");
const AWSXRay = require("aws-xray-sdk-core");

module.exports = class XRayInstanceFactory {
  makeInstances() {
    const instances = { $lambda: new AWS.Lambda() };
    AWSXRay.captureAWSClient(instances.$lambda);
    return instances;
  }
};
