const { SNS } = require("aws-sdk");

module.exports = class SnsRestaurantNotificationTopic {
  constructor(snsArn) {
    this.sns = new SNS();
    this.snsArn = snsArn;
  }

  publish(order) {
    const snsParams = {
      Message: JSON.stringify(order),
      TopicArn: this.snsArn
    };
    return this.sns.publish(snsParams).promise();
  }
};
