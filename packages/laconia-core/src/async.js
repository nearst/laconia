const laconia = require("./laconia");

module.exports = app => {
  const laconiaSync = laconia(app);
  const laconiaAsync = async (event, context) => laconiaSync(event, context);
  return Object.assign(laconiaAsync, laconiaSync);
};
