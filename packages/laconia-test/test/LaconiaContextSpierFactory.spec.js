const LaconiaContextSpierFactory = require("../src/LaconiaContextSpierFactory");
const S3Spier = require("../src/S3Spier");
const NullSpier = require("../src/NullSpier");

describe("LaconiaContextSpierFactory", () => {
  let lc;
  beforeEach(() => {
    lc = {
      env: {},
      context: { functionName: "function name" }
    };
  });

  describe("when bucket name is set", () => {
    let spierFactory;
    beforeEach(() => {
      lc.env.LACONIA_TEST_SPY_BUCKET = "bucket name";
      spierFactory = new LaconiaContextSpierFactory(lc);
    });

    it("should return a new instance of S3Spier", () => {
      const spy = spierFactory.makeSpier();
      expect(spy).toBeInstanceOf(S3Spier);
    });

    it("should set bucket name from env variable", () => {
      const spy = spierFactory.makeSpier();
      expect(spy.bucketName).toEqual("bucket name");
    });

    it("should set function name from context variable", () => {
      const spy = spierFactory.makeSpier();
      expect(spy.functionName).toEqual("function name");
    });
  });

  describe("when bucket name is not set", () => {
    it("should return a new instance of NullSpier when bucket name is not defined", () => {
      lc.env.LACONIA_TEST_SPY_BUCKET = undefined;
      const spierFactory = new LaconiaContextSpierFactory(lc);
      const spy = spierFactory.makeSpier();
      expect(spy).toBeInstanceOf(NullSpier);
    });

    it("should return a new instance of NullSpier when bucket name is 'disabled'", () => {
      lc.env.LACONIA_TEST_SPY_BUCKET = "disabled";
      const spierFactory = new LaconiaContextSpierFactory(lc);
      const spy = spierFactory.makeSpier();
      expect(spy).toBeInstanceOf(NullSpier);
    });
  });
});
