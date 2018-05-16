const createEvent = require("aws-event-mocks");
const handler = require("../src/place-order").handler;

describe("place-order", () => {
  let order, event, lc;

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
    event = createEvent({
      template: "aws:apiGateway",
      merge: {
        body: JSON.stringify({
          order
        })
      }
    });

    lc = {
      event,
      orderRepository: {
        save: jest.fn().mockReturnValue(Promise.resolve())
      },
      idGenerator: {
        generate: jest.fn().mockReturnValue("123")
      }
    };
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

  it("should set OrderId to order body", async () => {
    lc.idGenerator.generate.mockReturnValueOnce("123");
    await handler.run(lc);

    expect(lc.orderRepository.save).toHaveBeenCalledTimes(1);
    const orderResult = lc.orderRepository.save.mock.calls[0][0];

    expect(orderResult.OrderId).toBeString();
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

    expect(order1.OrderId).toEqual("123");
    expect(order2.OrderId).toEqual("456");
  });
});
