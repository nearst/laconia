const getResponseProps = require("./getResponseProps");

module.exports = body => {
  const { contentType } = getResponseProps(body);
  return contentType;
};
