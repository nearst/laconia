const laconia = require("@laconia/core");

const handler = async event => {
  console.log(event.Records.map(r => JSON.parse(r.body)));
};

module.exports.handler = laconia(handler);
