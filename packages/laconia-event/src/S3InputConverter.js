module.exports = class S3InputConverter {
  convert(event) {
    const record = event.Records[0];
    const { key } = record.s3.object;
    const { name } = record.s3.bucket;
    return { key: decodeURIComponent(key.replace(/\+/g, " ")), bucket: name };
  }
};
