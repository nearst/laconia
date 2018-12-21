const laconiaEvent = require("@laconia/event").s3Json();
const S3TotalOrderStorage = require("./S3TotalOrderStorage");

const instances = ({ $s3, env }) => ({
  totalOrderStorage: new S3TotalOrderStorage($s3, env.TOTAL_ORDER_BUCKET_NAME)
});

const handler = async (totalOrder, { totalOrderStorage }) => {
  await totalOrderStorage.put(
    "xml",
    `<TotalOrder><RestaurantId>${
      totalOrder.restaurantId
    }</RestaurantId><Total>${totalOrder.total}</Total></TotalOrder>`
  );
};

module.exports.handler = laconiaEvent(handler).register(instances);
