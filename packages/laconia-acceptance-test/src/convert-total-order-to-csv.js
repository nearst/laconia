const laconia = require("@laconia/core");

const handler = async (event, { totalOrderStorage }) => {
  const record = event.Records[0];
  console.log(record);
  const { key } = record.s3.object;

  await totalOrderStorage.putCsv(key);
};

module.exports.handler = laconia(handler);
