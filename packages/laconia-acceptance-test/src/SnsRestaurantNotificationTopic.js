module.exports = class SnsRestaurantNotificationTopic {
  constructor(sns, snsArn) {
    this.sns = sns;
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
