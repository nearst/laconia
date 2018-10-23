const createS3Params = objectPath => {
  const splitPath = objectPath.split("/");
  const Bucket = splitPath.shift();
  const Key = splitPath.join("/");
  return {
    Bucket,
    Key
  };
};

module.exports = class S3Converter {
  constructor(s3) {
    this.s3 = s3;
  }

  async _getObjectMap(objectPaths) {
    const objectMap = {};
    await Promise.all(
      objectPaths.map(objectPath => {
        if (!objectPath.endsWith(".json")) {
          throw new Error(
            `Object path must have .json extension. ${objectPath} was found`
          );
        }
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
    const objectMap = await this._getObjectMap(Object.values(values));
    return Object.keys(values).reduce((acc, value) => {
      acc[value] = objectMap[values[value]];
      return acc;
    }, {});
  }
};
