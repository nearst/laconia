const { v4: uuidv4 } = require("uuid");

module.exports = class UuidIdGenerator {
  generate() {
    return uuidv4();
  }
};
