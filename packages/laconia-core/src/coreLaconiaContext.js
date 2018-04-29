const invoke = require("./invoke");
const recurse = require("./recurse");

const prefixKeys = (prefix, object) => {
  const keyValues = Object.keys(object).map(key => {
    const newKey = `${prefix}${key}`;
    return { [newKey]: object[key] };
  });
  return Object.assign({}, ...keyValues);
};

module.exports = laconiaContext => {
  const coreMembers = {
    invoke,
    recurse: recurse(laconiaContext),
    env: process.env
  };
  const coreLaconiaContext = Object.assign(
    {},
    laconiaContext,
    coreMembers,
    prefixKeys("$", coreMembers)
  );
  coreLaconiaContext.inject = member => {
    return Object.assign(coreLaconiaContext, member);
  };
  return coreLaconiaContext;
};
