const AWS = require("aws-sdk");
const XRayInstanceFactory = require("../src/XRayInstanceFactory");

describe("XRayInstanceFactory", () => {
  it("creates a lambda instance", async () => {
    const instances = new XRayInstanceFactory().makeInstances();
    expect(instances.$lambda).toBeInstanceOf(AWS.Lambda);
  });
});
