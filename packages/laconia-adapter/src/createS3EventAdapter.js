const S3EventAdapter = require("./S3EventAdapter");
const S3JsonInputConverter = require("./S3JsonInputConverter");
const S3StreamInputConverter = require("./S3StreamInputConverter");
const S3TextInputConverter = require("./S3TextInputConverter");

const createInputConverter = inputType => {
  if (inputType === "text") {
    return new S3TextInputConverter();
  } else if (inputType === "object") {
    return new S3JsonInputConverter();
  } else if (inputType === "stream") {
    return new S3StreamInputConverter();
  } else {
    throw new Error("Unsupported inputType: " + inputType);
  }
};

const createS3Adapter = ({
  inputType = "object",
  functional = true
} = {}) => app => {
  const adapter = new S3EventAdapter(app, createInputConverter(inputType));
  return functional ? adapter.toFunction() : adapter;
};

module.exports = createS3Adapter;
