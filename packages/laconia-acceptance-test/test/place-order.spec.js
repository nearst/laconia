const handler = require("../src/place-order").mainHandler;

describe("place-order", () => {
  let order, lc, newOrder, headers;

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

    headers = {
      Authorization: "secret"
    };
    newOrder = { order };
    lc = {
      orderRepository: {
        save: jest.fn().mockReturnValue(Promise.resolve())
      },
      orderStream: {
        send: jest.fn().mockReturnValue(Promise.resolve())
      },
      idGenerator: {
        generate: jest.fn().mockReturnValue("123")
      },
      apiKey: "secret",
      restaurants: [5],
      enabled: true
    };
  });

  it("should throw error when apiKey is wrong", async () => {
    lc.apiKey = "wrong";

    await expect(handler(newOrder, headers, lc)).rejects.toThrow(
      "Wrong API Key"
    );
  });

  it("should throw error when restaurantId is not valid", async () => {
    order.restaurantId = 1;

    await expect(handler(newOrder, headers, lc)).rejects.toThrow(
      "Invalid restaurant id"
    );
  });

  it("should store order to order table", async () => {
    await handler(newOrder, headers, lc);

    expect(lc.orderRepository.save).toBeCalledWith(
      expect.objectContaining(order)
    );
  });

  it("should store order to order stream", async () => {
    await handler(newOrder, headers, lc);

    expect(lc.orderStream.send).toBeCalledWith({
      orderId: "123",
      eventType: "placed",
      restaurantId: 5
    });
  });

  it("should return orderId upon successful save", async () => {
    const result = await handler(newOrder, headers, lc);

    expect(result).toEqual({ orderId: "123" });
  });

  it("should set orderId to order body", async () => {
    lc.idGenerator.generate.mockReturnValueOnce("123");
    await handler(newOrder, headers, lc);

    expect(lc.orderRepository.save).toHaveBeenCalledTimes(1);
    const orderResult = lc.orderRepository.save.mock.calls[0][0];

    expect(orderResult.orderId).toBeString();
  });

  it("should be able to turn lambda off", async () => {
    lc.enabled = false;
    await expect(handler(newOrder, headers, lc)).rejects.toThrow(
      "Place order lambda is off"
    );
  });

  it("should call id generator to generate random order id on every call", async () => {
    lc.idGenerator.generate
      .mockReturnValueOnce("123")
      .mockReturnValueOnce("456");

    await handler(newOrder, headers, lc);
    await handler(newOrder, headers, lc);

    expect(lc.orderRepository.save).toHaveBeenCalledTimes(2);
    expect(lc.idGenerator.generate).toHaveBeenCalledTimes(2);
    const order1 = lc.orderRepository.save.mock.calls[0][0];
    const order2 = lc.orderRepository.save.mock.calls[1][0];

    expect(order1.orderId).toEqual("123");
    expect(order2.orderId).toEqual("456");
  });
});
