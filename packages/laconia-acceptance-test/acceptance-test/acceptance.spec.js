const frisby = require("frisby");
const uuidv4 = require("uuid/v4");
const Joi = frisby.Joi;
const DynamoDbOrderRepository = require("../src/DynamoDbOrderRepository");
const S3TotalOrderStorage = require("../src/S3TotalOrderStorage");
const laconiaTest = require("@laconia/test");
const WebSocket = require("ws");

const SERVERLESS_SERVICE_NAME = "laconia-acceptance";
const SERVERLESS_STAGE = process.env.NODE_VERSION;
const prefix = `${SERVERLESS_SERVICE_NAME}-${SERVERLESS_STAGE}`;
const name = name => `${prefix}-${name}`;
const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

jest.setTimeout(10000);

frisby.globalSetup({
  request: {
    headers: {
      Authorization: "supersecretkey"
    }
  }
});

const deleteAllItems = async (tableName, keyName, keyValue) => {
  const params = { TableName: tableName };
  const data = await documentClient.scan(params).promise();
  for (const item of data.Items) {
    const deleteParams = {
      TableName: tableName,
      Key: { [keyName]: keyValue(item) }
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

const placeOrder = async (url, order) => {
  const response = await frisby
    .post(url, { order })
    .expect("status", 200)
    .expect("jsonTypes", {
      orderId: Joi.string()
    });

  return response.json;
};

const getOrderUrl = async () => {
  const apig = new AWS.APIGateway();
  const restApis = await apig.getRestApis().promise();
  const restApiName = `${SERVERLESS_STAGE}-${SERVERLESS_SERVICE_NAME}`;
  const restApi = restApis.items.find(i => i.name === restApiName);
  if (!restApi) {
    throw new Error(`${restApiName} could not be found!`);
  }
  return `https://${restApi.id}.execute-api.eu-west-1.amazonaws.com/${SERVERLESS_STAGE}/order`;
};

const getWebSocketUrl = async () => {
  const apig = new AWS.ApiGatewayV2();
  const wsApis = await apig.getApis().promise();
  const wsApiName = `${SERVERLESS_STAGE}-${SERVERLESS_SERVICE_NAME}-websockets`;
  const wsApi = wsApis.Items.find(i => i.Name === wsApiName);
  if (!wsApi) {
    throw new Error(`${wsApiName} could not be found!`);
  }
  return `${wsApi.ApiEndpoint}/${SERVERLESS_STAGE}`;
};

class WebSocketOrderMessenger {
  constructor(webSocketUrl) {
    this.ws = new WebSocket(webSocketUrl);
  }

  _waitForMessage(messageType) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(`Did not get any ${messageType} message from web socket`)
        );
      }, 40000);

      this.ws.on("message", data => {
        clearTimeout(timeout);
        resolve(data);
      });

      this.ws.on("error", err => {
        console.log("websocket error", err);
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  waitForOrderAcceptedMessage() {
    return this._waitForMessage("order accepted");
  }

  waitForThankYouMessage() {
    return this._waitForMessage("thank you");
  }

  orderReceived() {
    this.ws.send(JSON.stringify({ message: "order received" }));
  }

  close() {
    this.ws.close();
  }
}

describe("order flow", () => {
  let orderRepository;
  let totalOrderStorage;
  let orderMap;
  let orderUrl;
  let orderMessagePromise;
  let orderMessenger;

  const captureCardPayment = laconiaTest(name("capture-card-payment"), {
    spy: {
      bucketName: name("tracker")
    }
  });
  const sendEmail = laconiaTest(name("send-email"), {
    spy: {
      bucketName: name("tracker")
    }
  });

  beforeAll(async () => {
    await deleteAllItems(name("order"), "orderId", item => item.orderId);
    await deleteAllItems(
      name("connection"),
      "connectionId",
      item => item.connectionId
    );
    orderRepository = new DynamoDbOrderRepository(name("order"));
    totalOrderStorage = new S3TotalOrderStorage(
      new AWS.S3(),
      name("total-order")
    );
  });

  beforeAll(async () => {
    orderUrl = await getOrderUrl();
  });
  beforeAll(() => captureCardPayment.spy.clear());
  beforeAll(() => sendEmail.spy.clear());
  beforeAll(() => totalOrderStorage.clearAll());

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
    const orderUrl = await getOrderUrl();
    const responses = await Promise.all(
      orders.map(order => placeOrder(orderUrl, order))
    );
    const orderIds = responses.map(response => response.orderId);

    orderMap = orders.reduce((acc, order, i) => {
      acc[orderIds[i]] = order;
      return acc;
    }, {});

    orderMessenger = new WebSocketOrderMessenger(await getWebSocketUrl());
    orderMessagePromise = orderMessenger.waitForOrderAcceptedMessage();
  });

  afterAll(() => {
    orderMessenger.close();
  });

  describe("happy path", () => {
    it("should store all placed orders in Order Table", async () => {
      Object.keys(orderMap).forEach(async orderId => {
        const savedOrder = await orderRepository.find(orderId);
        expect(savedOrder).toEqual(expect.objectContaining(orderMap[orderId]));
        expect(savedOrder.orderId).toEqual(orderId);
      });
    });

    it("should invoke send email lambda, which is coming from the chain of place-order, notify-restaurant, fake-restaurant, accept-order, and notify-user", async () => {
      await sendEmail.spy.waitForTotalInvocations(1);
      const invocations = await sendEmail.spy.getInvocations();
      expect(JSON.parse(invocations[0].event.Records[0].body)).toEqual(
        expect.objectContaining({
          eventType: "accepted",
          orderId: expect.any(String)
        })
      );
    }, 20000);

    it("should receive a reply from order websocket", async () => {
      const orderAcceptedMessage = await orderMessagePromise;
      expect(JSON.parse(orderAcceptedMessage).message).toEqual(
        "order accepted"
      );

      orderMessenger.orderReceived();

      const thankYouMessage = await orderMessenger.waitForThankYouMessage();
      expect(JSON.parse(thankYouMessage).message).toEqual(
        "thank you for your order"
      );
    }, 10000);

    it("should capture all card payments", async () => {
      await laconiaTest(name("process-card-payments")).fireAndForget();
      await captureCardPayment.spy.waitForTotalInvocations(10);
      const invocations = await captureCardPayment.spy.getInvocations();
      const capturedPaymentReferences = invocations
        .map(t => t.event.paymentReference)
        .sort();
      const paymentReferences = Object.values(orderMap)
        .map(order => order.paymentReference)
        .sort();

      expect(capturedPaymentReferences).toEqual(paymentReferences);
    }, 20000);

    it("should calculate total order for every restaurants", async () => {
      await laconiaTest(name("calculate-total-order")).fireAndForget();

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
      await totalOrderStorage.waitUntil("json", 10);

      const totalOrderJsons = await totalOrderStorage.getAll("json");
      const sortedTotalOrderJsons = totalOrderJsons.sort(
        (a, b) => a.restaurantId - b.restaurantId
      );
      expect(sortedTotalOrderJsons).toEqual(expectedTotalOrder);
    }, 20000);

    it("should convert total order for every restaurants to xml", async () => {
      const expectedTotalOrderXmls = [
        "<TotalOrder><RestaurantId>1</RestaurantId><Total>10</Total></TotalOrder>",
        "<TotalOrder><RestaurantId>2</RestaurantId><Total>8</Total></TotalOrder>",
        "<TotalOrder><RestaurantId>3</RestaurantId><Total>0</Total></TotalOrder>",
        "<TotalOrder><RestaurantId>4</RestaurantId><Total>0</Total></TotalOrder>",
        "<TotalOrder><RestaurantId>5</RestaurantId><Total>15</Total></TotalOrder>",
        "<TotalOrder><RestaurantId>6</RestaurantId><Total>31</Total></TotalOrder>",
        "<TotalOrder><RestaurantId>7</RestaurantId><Total>0</Total></TotalOrder>",
        "<TotalOrder><RestaurantId>8</RestaurantId><Total>0</Total></TotalOrder>",
        "<TotalOrder><RestaurantId>9</RestaurantId><Total>110</Total></TotalOrder>",
        "<TotalOrder><RestaurantId>10</RestaurantId><Total>0</Total></TotalOrder>"
      ];
      await totalOrderStorage.waitUntil("xml", 10);
      const totalOrderXmls = await totalOrderStorage.getAll("xml");
      expect(totalOrderXmls.length).toEqual(10);
      totalOrderXmls.forEach(totalOrderXml =>
        expect(expectedTotalOrderXmls).toContain(totalOrderXml)
      );
    });
  });

  describe("error scenario", () => {
    describe("place-order", () => {
      it("should return status 400 when restaurantId is invalid", async () => {
        const order = createOrder(-1, 10);
        await frisby.post(orderUrl, { order }).expect("status", 400);
      });
    });

    describe("capture-card-payment", () => {
      it("should throw an error when paymentReference is not defined", async () => {
        const captureCardPayment = laconiaTest(name("capture-card-payment"));
        await expect(captureCardPayment.requestResponse()).rejects.toThrow(
          "paymentReference is required"
        );
      });
    });
  });
});
