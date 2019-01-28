module.exports = class SnsJsonInputConverter {
  convert(event) {
    return JSON.parse(event.Records[0].Sns.Message);
  }
};
