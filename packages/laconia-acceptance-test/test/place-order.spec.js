const createEvent = require("aws-event-mocks");
const handler = require("../src/place-order").handler;

describe("place-order", () => {
  it("should store order to order table", async () => {
    const order = {
      restaurantId: 5,
      customer: {
        name: "Sam"
      },
      menu: {
        food: "chicken"
      }
    };
    const event = createEvent({
      template: "aws:apiGateway",
      merge: {
        body: {
          order
        }
      }
    });

    const lc = {
      event,
      orderRepository: {
        save: jest.fn().mockReturnValue(Promise.resolve())
      }
    };

    await handler.run(lc);

    expect(lc.orderRepository.save).toBeCalledWith(order);
  });
});
