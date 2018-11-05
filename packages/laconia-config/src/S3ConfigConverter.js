const createS3Params = objectPath => {
  const splitPath = objectPath.split("/");
  const Bucket = splitPath.shift();
  const Key = splitPath.join("/");
  return {
    Bucket,
    Key
  };
};

const validateObjectPath = objectPath => {
  if (!objectPath.endsWith(".json")) {
    throw new Error(
      `Object path must have .json extension. ${objectPath} was found`
    );
  }
};

module.exports = class S3ConfigConverter {
  constructor(s3) {
    this.s3 = s3;
  }

  async _getObjectMap(objectPaths) {
    const objectMap = {};
    await Promise.all(
      objectPaths.map(objectPath => {
        return this.s3
          .getObject(createS3Params(objectPath))
          .promise()
          .then(data => {
            objectMap[objectPath] = JSON.parse(data.Body);
          });
      })
    );

    return objectMap;
  }

  async convertMultiple(values) {
    const objectPaths = Object.values(values);
    objectPaths.forEach(o => validateObjectPath(o));
    const objectMap = await this._getObjectMap(objectPaths);
    return Object.keys(values).reduce((acc, key) => {
      acc[key] = objectMap[values[key]];
      return acc;
    }, {});
  }
};
