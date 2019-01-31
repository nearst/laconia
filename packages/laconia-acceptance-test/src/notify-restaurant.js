const laconia = require("@laconia/core");
const kinesis = require("@laconia/adapter").kinesis();
const SnsRestaurantNotificationTopic = require("./SnsRestaurantNotificationTopic");

const instances = ({ $sns, env }) => ({
  restaurantNotificationTopic: new SnsRestaurantNotificationTopic(
    $sns,
    env.RESTAURANT_NOTIFICATION_TOPIC_ARN
  )
});

const app = async (orderEvents, { restaurantNotificationTopic }) => {
  return Promise.all(
    orderEvents
      .filter(o => o.eventType === "placed")
      .map(o => restaurantNotificationTopic.publish(o))
  );
};

exports.handler = laconia(kinesis(app)).register(instances);
