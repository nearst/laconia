const LaconiaContextSpyerFactory = require("../src/LaconiaContextSpyerFactory");
const S3Spyer = require("../src/S3Spyer");
const NullSpyer = require("../src/NullSpyer");

describe("LaconiaContextSpyerFactory", () => {
  let lc;
  beforeEach(() => {
    lc = {
      env: {}
    };
  });

  describe("when bucket name is set", () => {
    let spyerFactory;
    beforeEach(() => {
      lc.env.LACONIA_TEST_SPY_BUCKET_NAME = "bucket name";
      spyerFactory = new LaconiaContextSpyerFactory(lc);
    });

    it("should return a new instance of S3Spyer", () => {
      const spy = spyerFactory.makeSpy();
      expect(spy).toBeInstanceOf(S3Spyer);
    });

    it("should set bucket name from env variable", () => {
      const spy = spyerFactory.makeSpy();
      expect(spy.bucketName).toEqual("bucket name");
    });
  });

  describe("when bucket name is not set", () => {
    it("should return a new instance of NullSpyer when bucket name is not defined", () => {
      lc.env.LACONIA_TEST_SPY_BUCKET_NAME = undefined;
      const spyerFactory = new LaconiaContextSpyerFactory(lc);
      const spy = spyerFactory.makeSpy();
      expect(spy).toBeInstanceOf(NullSpyer);
    });

    it("should return a new instance of NullSpyer when bucket name is 'disabled'", () => {
      lc.env.LACONIA_TEST_SPY_BUCKET_NAME = "disabled";
      const spyerFactory = new LaconiaContextSpyerFactory(lc);
      const spy = spyerFactory.makeSpy();
      expect(spy).toBeInstanceOf(NullSpyer);
    });
  });
});
