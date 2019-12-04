const { STS } = require("aws-sdk");
const sts = new STS();

exports.getAccountId = async () => {
  const { Account } = await sts.getCallerIdentity().promise();
  return Account;
};
