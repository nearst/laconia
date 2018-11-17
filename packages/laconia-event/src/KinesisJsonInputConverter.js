const parseKinesisPayload = record => {
  let json = Buffer.from(record.kinesis.data, "base64").toString("utf8");
  return JSON.parse(json);
};

module.exports = class KinesisJsonInputConverter {
  convert(event) {
    return event.Records.map(parseKinesisPayload);
  }
};
