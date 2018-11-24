module.exports = class SnsJsonInputConverter {
  convert(event) {
    return event.Records.map(r => JSON.parse(r.body));
  }
};
