const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const createS3Params = objectPath => {
  const splitPath = objectPath.split("/");
  const Bucket = splitPath.shift();
  const Key = splitPath.join("/");
  return new GetObjectCommand({
    Bucket,
    Key
  });
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
    this.s3 = s3 || new S3Client({});
  }

  async _getObjectMap(objectPaths) {
    const objectMap = {};
    await Promise.all(
      objectPaths.map(async objectPath => {
        const { Body } = await this.s3.send(createS3Params(objectPath));
        if (!Body) return;
        objectMap[objectPath] = JSON.parse(await Body.transformToString());
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
