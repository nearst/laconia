const { laconia } = require("laconia-core");

module.exports.handler = laconia(({ event, invoke }) => {
  return invoke("hello").requestResponse(event.payload);
});
