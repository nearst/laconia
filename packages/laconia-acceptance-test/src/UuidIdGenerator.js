const uuidv4 = require("uuid/v4");

module.exports = class UuidIdGenerator {
  generate() {
    return uuidv4();
  }
};
