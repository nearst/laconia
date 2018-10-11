const { EnvVarInstanceFactory } = require("@laconia/core");

const createS3Params = objectPath => {
  const splitPath = objectPath.split("/");
  const Bucket = splitPath.shift();
  const Key = splitPath.join("/");
  return {
    Bucket,
    Key
  };
};

module.exports = class EnvVarS3ConfigFactory extends EnvVarInstanceFactory {
  constructor(env, s3) {
    super(env, "LACONIA_S3CONFIG_");
    this.s3 = s3;
  }

  async _preMakeInstance(envVar) {
    this._objectMap = {};
    return Promise.all(
      Object.values(envVar).map(objectPath => {
        if (!objectPath.endsWith(".json")) {
          throw new Error(
            `Object path must have .json extension. ${objectPath} was found`
          );
        }
        return this.s3
          .getObject(createS3Params(objectPath))
          .promise()
          .then(data => {
            this._objectMap[objectPath] = JSON.parse(data.Body);
          });
      })
    );
  }

  _makeInstance(value) {
    return this._objectMap[value];
  }
};
