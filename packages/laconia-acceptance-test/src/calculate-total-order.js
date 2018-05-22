const { laconiaBatch, s3 } = require("laconia-batch");
const testHelper = require("laconia-test-helper");
const DynamoDbOrderRepository = require("./DynamoDbOrderRepository");

module.exports.handler = laconiaBatch(
  _ =>
    s3({
      path: ".",
      s3Params: {
        Bucket: process.env["RESTAURANT_BUCKET_NAME"],
        Key: "restaurants.json"
      }
    }),
  { itemsPerSecond: 2 }
).on("item", async ({ context, env }, restaurantId) => {
  const tracker = testHelper.tracker(context.functionName);
  const orderRepository = new DynamoDbOrderRepository(env.ORDER_TABLE_NAME);
  const orders = await orderRepository.findByRestaurantId(restaurantId);
  tracker.tick({
    restaurantId,
    total: orders.reduce((acc, order) => acc + order.total, 0)
  });
});
