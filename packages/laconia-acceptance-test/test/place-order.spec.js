const createEvent = require("aws-event-mocks");
const handler = require("../src/place-order").handler;

const createOrderEvent = order =>
  createEvent({
    template: "aws:apiGateway",
    merge: {
      body: JSON.stringify({
        order
      }),
      headers: {
        Authorization: "secret"
      }
    }
  });

describe("place-order", () => {
  let order, lc;

  beforeEach(() => {
    order = {
      restaurantId: 5,
      customer: {
        name: "Sam"
      },
      menu: {
        food: "chicken"
      }
    };

    lc = {
      event: createOrderEvent(order),
      orderRepository: {
        save: jest.fn().mockReturnValue(Promise.resolve())
      },
      idGenerator: {
        generate: jest.fn().mockReturnValue("123")
      },
      apiKey: "secret",
      restaurants: [5]
    };
  });

  it("should throw error when apiKey is wrong", async () => {
    lc.apiKey = "wrong";

    await expect(handler.run(lc)).rejects.toThrow("Wrong API Key");
  });

  it("should throw error when restaurantId is not valid", async () => {
    order.restaurantId = 1;
    lc.event = createOrderEvent(order);

    await expect(handler.run(lc)).rejects.toThrow("Invalid restaurant id");
  });

  it("should store order to order table", async () => {
    await handler.run(lc);

    expect(lc.orderRepository.save).toBeCalledWith(
      expect.objectContaining(order)
    );
  });

  it("should return orderId upon successful save", async () => {
    const response = await handler.run(lc);

    expect(response).toEqual(
      expect.objectContaining({ body: JSON.stringify({ orderId: "123" }) })
    );
  });

  it("should set orderId to order body", async () => {
    lc.idGenerator.generate.mockReturnValueOnce("123");
    await handler.run(lc);

    expect(lc.orderRepository.save).toHaveBeenCalledTimes(1);
    const orderResult = lc.orderRepository.save.mock.calls[0][0];

    expect(orderResult.orderId).toBeString();
  });

  it("should call id generator to generate random order id on every call", async () => {
    lc.idGenerator.generate
      .mockReturnValueOnce("123")
      .mockReturnValueOnce("456");

    await handler.run(lc);
    await handler.run(lc);

    expect(lc.orderRepository.save).toHaveBeenCalledTimes(2);
    expect(lc.idGenerator.generate).toHaveBeenCalledTimes(2);
    const order1 = lc.orderRepository.save.mock.calls[0][0];
    const order2 = lc.orderRepository.save.mock.calls[1][0];

    expect(order1.orderId).toEqual("123");
    expect(order2.orderId).toEqual("456");
  });
});
