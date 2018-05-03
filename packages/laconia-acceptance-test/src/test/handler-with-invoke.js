const { laconia } = require("laconia-core");

module.exports.handler = laconia(({ event, invoke }) => {
  return invoke("hello").requestResponse(event.payload);
});

module.exports.handler = laconia(({ event, hello }) => {
  return hello.requestResponse(event.payload);
}).on("init", lc => {
  lc.inject({ hello: lc.invoke(lc.env.HELLO_FUNCTION_NAME) });
});
