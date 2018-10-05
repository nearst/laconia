const AWS = require("aws-sdk");

module.exports = class XRayInstanceFactory {
  makeInstances() {
    return { $lambda: new AWS.Lambda() };
  }
};
