const LaconiaContextSpierFactory = require("../src/LaconiaContextSpierFactory");
const S3Spier = require("../src/S3Spier");
const NullSpier = require("../src/NullSpier");

describe("LaconiaContextSpierFactory", () => {
  let lc;
  beforeEach(() => {
    lc = {
      env: {}
    };
  });

  describe("when bucket name is set", () => {
    let spierFactory;
    beforeEach(() => {
      lc.env.LACONIA_TEST_SPY_BUCKET_NAME = "bucket name";
      spierFactory = new LaconiaContextSpierFactory(lc);
    });

    it("should return a new instance of S3Spier", () => {
      const spy = spierFactory.makeSpy();
      expect(spy).toBeInstanceOf(S3Spier);
    });

    it("should set bucket name from env variable", () => {
      const spy = spierFactory.makeSpy();
      expect(spy.bucketName).toEqual("bucket name");
    });
  });

  describe("when bucket name is not set", () => {
    it("should return a new instance of NullSpier when bucket name is not defined", () => {
      lc.env.LACONIA_TEST_SPY_BUCKET_NAME = undefined;
      const spierFactory = new LaconiaContextSpierFactory(lc);
      const spy = spierFactory.makeSpy();
      expect(spy).toBeInstanceOf(NullSpier);
    });

    it("should return a new instance of NullSpier when bucket name is 'disabled'", () => {
      lc.env.LACONIA_TEST_SPY_BUCKET_NAME = "disabled";
      const spierFactory = new LaconiaContextSpierFactory(lc);
      const spy = spierFactory.makeSpy();
      expect(spy).toBeInstanceOf(NullSpier);
    });
  });
});
