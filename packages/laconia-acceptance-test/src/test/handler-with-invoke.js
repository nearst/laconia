const { laconia } = require("laconia-core");

module.exports.handler = laconia(({ event, hello }) => {
  return hello.requestResponse(event.payload);
}).on("init", lc => {
  lc.register({ hello: lc.invoke(lc.env.HELLO_FUNCTION_NAME) });
});
