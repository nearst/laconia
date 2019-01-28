const S3EventAdapter = require("./S3EventAdapter");
const S3JsonInputConverter = require("./S3JsonInputConverter");
const S3StreamInputConverter = require("./S3StreamInputConverter");
const S3EventInputConverter = require("./S3EventInputConverter");

const createInputConverter = inputType => {
  if (inputType === "object") {
    return new S3JsonInputConverter();
  } else if (inputType === "stream") {
    return new S3StreamInputConverter();
  } else if (inputType === "event") {
    return new S3EventInputConverter();
  } else {
    throw new Error("Unsupported inputType: " + inputType);
  }
};

const createApiAgatewayAdapter = ({
  inputType = "object",
  functional = true
} = {}) => app => {
  const adapter = new S3EventAdapter(app, createInputConverter(inputType));
  return functional ? adapter.toFunction() : adapter;
};

module.exports = createApiAgatewayAdapter;
