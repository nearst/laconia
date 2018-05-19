const _ = require("lodash");
const frisby = require("frisby");
const uuidv4 = require("uuid/v4");
const Joi = frisby.Joi;
const DynamoDbOrderRepository = require("../src/DynamoDbOrderRepository");
const { invoke } = require("laconia-core");
const tracker = require("laconia-test-helper").tracker;

const prefix = `laconia-acceptance-${process.env.NODE_VERSION}`;
const name = name => `${prefix}-${name}`;
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const documentClient = new AWS.DynamoDB.DocumentClient();

const items = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const getRequestIds = ticks => _.uniq(ticks.map(t => t.context.awsRequestId));

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

const createOrder = () => ({
  restaurantId: 5,
  customer: {
    name: "Sam"
  },
  menu: {
    food: "chicken"
  },
  paymentReference: uuidv4()
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

  beforeAll(async () => {
    await deleteAllItems(name("Order"));
    orderRepository = new DynamoDbOrderRepository(name("Order"));
  });

  beforeAll(() => captureCardPaymentTracker.clear());

  beforeAll(async () => {
    const orders = Array(10)
      .fill()
      .map(createOrder);
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

  it("should capture all card payments", async () => {
    await invoke(name("process-card-payments")).fireAndForget();
    await captureCardPaymentTracker.waitUntil(10);
    const ticks = await captureCardPaymentTracker.getTicks();
    const capturedPaymentReferences = ticks.sort();
    const paymentReferences = Object.keys(orderMap)
      .map(orderId => orderMap[orderId].paymentReference)
      .sort();

    expect(capturedPaymentReferences).toEqual(paymentReferences);
  });
});

describe("laconia-core handler", () => {
  it("returns result", async () => {
    const result = await invoke(name("handler-basic")).requestResponse();
    expect(result).toEqual("hello");
  });
});

describe("laconia-core recursion", () => {
  const recursiveTracker = tracker("recursive", name("tracker"));

  beforeAll(() => recursiveTracker.clear());

  it("recurses three times", async () => {
    await invoke(name("handler-recursive")).fireAndForget({ input: 1 });
    await recursiveTracker.waitUntil(3);
    expect(await recursiveTracker.getTotal()).toEqual(3);
  });
});

describe("laconia-batch s3-batch-handler", () => {
  const s3BatchTracker = tracker("batch-s3", name("tracker"));

  beforeAll(() =>
    s3
      .putObject({
        Bucket: name("bucket"),
        Key: "batch-s3.json",
        Body: JSON.stringify(items)
      })
      .promise());

  beforeAll(() => s3BatchTracker.clear());

  const getItems = ticks => ticks.map(t => t.item);

  it("processes all items", async () => {
    await invoke(name("batch-s3")).fireAndForget();
    await s3BatchTracker.waitUntil(10);

    const ticks = await s3BatchTracker.getTicks();
    expect(getRequestIds(ticks).length).toBeGreaterThanOrEqual(3);
    expect(getItems(ticks)).toEqual(items);
  });
});

describe("laconia-batch dynamodb-batch-handler", () => {
  const dynamoDbBatchTracker = tracker("batch-dynamoDb", name("tracker"));

  beforeAll(() =>
    documentClient
      .batchWrite({
        RequestItems: {
          [name("batch")]: items.map(i =>
            _.set({}, "PutRequest.Item.ArtistId", i)
          )
        }
      })
      .promise());

  beforeAll(() => dynamoDbBatchTracker.clear());

  const getArtistIds = ticks => ticks.map(t => t.item.ArtistId).sort();

  it("processes all items", async () => {
    await invoke(name("batch-dynamodb")).fireAndForget();
    await dynamoDbBatchTracker.waitUntil(10);

    const ticks = await dynamoDbBatchTracker.getTicks();
    expect(getRequestIds(ticks).length).toBeGreaterThanOrEqual(3);
    expect(getArtistIds(ticks)).toEqual(items);
  });
});
