const laconia = require("@laconia/core");
const s3 = require("@laconia/adapter").s3();
const S3TotalOrderStorage = require("./S3TotalOrderStorage");

const instances = ({ s3, env }) => ({
  totalOrderStorage: new S3TotalOrderStorage(s3, env.TOTAL_ORDER_BUCKET_NAME)
});

const app = async (totalOrder, { totalOrderStorage }) => {
  await totalOrderStorage.put(
    "xml",
    `<TotalOrder><RestaurantId>${totalOrder.restaurantId}</RestaurantId><Total>${totalOrder.total}</Total></TotalOrder>`
  );
};

exports.handler = laconia(s3(app)).register(instances);
