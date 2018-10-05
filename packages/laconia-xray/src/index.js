const XRayInstanceFactory = require("./XRayInstanceFactory");

exports.awsInstances = () => () => new XRayInstanceFactory().makeInstances();
