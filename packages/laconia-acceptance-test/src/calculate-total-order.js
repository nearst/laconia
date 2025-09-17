// @ts-check
const laconiaBatch = require("@laconia/batch");
const DynamoDbOrderRepository = require("./DynamoDbOrderRepository");
const S3TotalOrderStorage = require("./S3TotalOrderStorage");

const instances = ({ env }) => ({
  orderRepository: new DynamoDbOrderRepository(env.ORDER_TABLE_NAME),
  totalOrderStorage: new S3TotalOrderStorage(env.TOTAL_ORDER_BUCKET_NAME)
});

exports.handler = laconiaBatch(
  _ =>
    laconiaBatch.s3({
      path: ".",
      s3Params: {
        Bucket: process.env.RESTAURANT_BUCKET_NAME,
        Key: "restaurants.json"
      }
    }),
  { itemsPerSecond: 2 }
)
  .register(instances)
  .on("item", async ({ orderRepository, totalOrderStorage }, restaurantId) => {
    const orders = await orderRepository.findByRestaurantId(restaurantId);
    await totalOrderStorage.put("json", {
      restaurantId,
      total: orders.reduce((acc, order) => acc + order.total, 0)
    });
  });
