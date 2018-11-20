const laconia = require("@laconia/core");

const handler = async event => {
  console.log("order", JSON.parse(event.Records[0].Sns.Message));
};

module.exports.handler = laconia(handler);
