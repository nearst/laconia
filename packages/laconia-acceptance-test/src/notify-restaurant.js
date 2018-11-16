const laconia = require("@laconia/core");

const parsePayload = record => {
  let json = Buffer.from(record.kinesis.data, "base64").toString("utf8");
  return JSON.parse(json);
};

const handler = async event => {
  const events = event.Records.map(parsePayload);
  console.log(events);
};

module.exports.handler = laconia(handler);
