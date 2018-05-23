const frisby = require("frisby");
const uuidv4 = require("uuid/v4");
const Joi = frisby.Joi;
const DynamoDbOrderRepository = require("../src/DynamoDbOrderRepository");
const { invoke } = require("laconia-core");
const tracker = require("laconia-test-helper").tracker;

const prefix = `laconia-acceptance-${process.env.NODE_VERSION}`;
const name = name => `${prefix}-${name}`;
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

jest.setTimeout(10000);

const deleteAllItems = async tableName => {
  const params = { TableName: tableName };
  const data = await documentClient.scan(params).promise();
  for (const item of data.Items) {
    const deleteParams = {
      TableName: tableName,
      Key: { OrderId: item.OrderId }
    };
    await documentClient.delete(deleteParams).promise();
  }
};

const createOrder = (restaurantId, total) => ({
  restaurantId,
  customer: {
    name: "Sam"
  },
  menu: {
    food: "chicken"
  },
  paymentReference: uuidv4(),
  total
});

const placeOrder = async order => {
  const response = await frisby
    .post(
      "https://y3lie63fw8.execute-api.eu-west-1.amazonaws.com/node8/order",
      { order }
    )
    .expect("status", 200)
    .expect("jsonTypes", {
      orderId: Joi.string()
    });

  return response.json;
};

describe("order flow", () => {
  let orderRepository;
  let orderMap;
  const captureCardPaymentTracker = tracker(
    name("capture-card-payment"),
    name("tracker")
  );

  const calculateTotalOrderTracker = tracker(
    name("calculate-total-order"),
    name("tracker")
  );

  beforeAll(async () => {
    await deleteAllItems(name("Order"));
    orderRepository = new DynamoDbOrderRepository(name("Order"));
  });

  beforeAll(() => captureCardPaymentTracker.clear());
  beforeAll(() => calculateTotalOrderTracker.clear());

  beforeAll(async () => {
    const orders = [
      { restaurantId: 1, total: 10 },
      { restaurantId: 2, total: 3 },
      { restaurantId: 2, total: 5 },
      { restaurantId: 5, total: 7 },
      { restaurantId: 5, total: 8 },
      { restaurantId: 6, total: 10 },
      { restaurantId: 6, total: 1 },
      { restaurantId: 6, total: 20 },
      { restaurantId: 9, total: 100 },
      { restaurantId: 9, total: 10 }
    ].map(({ restaurantId, total }) => createOrder(restaurantId, total));
    const responses = await Promise.all(orders.map(order => placeOrder(order)));
    const orderIds = responses.map(response => response.orderId);

    orderMap = orders.reduce((acc, order, i) => {
      acc[orderIds[i]] = order;
      return acc;
    }, {});
  });

  it("should store all placed orders in Order Table", async () => {
    Object.keys(orderMap).forEach(async orderId => {
      const savedOrder = await orderRepository.find(orderId);
      expect(savedOrder).toEqual(expect.objectContaining(orderMap[orderId]));
      expect(savedOrder.OrderId).toEqual(orderId);
    });
  });

  it(
    "should capture all card payments",
    async () => {
      await invoke(name("process-card-payments")).fireAndForget();
      await captureCardPaymentTracker.waitUntil(10);
      const ticks = await captureCardPaymentTracker.getTicks();
      const capturedPaymentReferences = ticks.sort();
      const paymentReferences = Object.values(orderMap)
        .map(order => order.paymentReference)
        .sort();

      expect(capturedPaymentReferences).toEqual(paymentReferences);
    },
    20000
  );

  it(
    "should calculate total order for every restaurants",
    async () => {
      await invoke(name("calculate-total-order")).fireAndForget();
      await calculateTotalOrderTracker.waitUntil(10);
      const ticks = await calculateTotalOrderTracker.getTicks();
      const actualTotalOrder = ticks;

      const expectedTotalOrder = [
        { restaurantId: 1, total: 10 },
        { restaurantId: 2, total: 8 },
        { restaurantId: 3, total: 0 },
        { restaurantId: 4, total: 0 },
        { restaurantId: 5, total: 15 },
        { restaurantId: 6, total: 31 },
        { restaurantId: 7, total: 0 },
        { restaurantId: 8, total: 0 },
        { restaurantId: 9, total: 110 },
        { restaurantId: 10, total: 0 }
      ];

      expect(actualTotalOrder).toEqual(expectedTotalOrder);
    },
    20000
  );
});
