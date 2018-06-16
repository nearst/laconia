# laconia-core

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia — Micro AWS Lambda framework

An AWS Lambda handler function is a single entry point for both injecting dependencies
and function execution. In non-serverless development, you can and will normally
only focus on the latter. This brings a unique challenge to AWS Lambda development
as it is very difficult to test a handler function when it is responsible for doing
both the object creations and the application run. laconia-core is a simple dependency
injection framework for your Lambda code, hence solving this problem for you.

Laconia explicitly splits the responsibility of the object creations and Lambda function execution.
Laconia also provides a simple way for you to execute your Lambda function
so that your unit tests will not execute the code that instantiates your Lambda dependencies.

## FAQ

Check out [FAQ](https://github.com/ceilfors/laconia#faq)

## Usage

Install laconia-core using yarn:

```
yarn add laconia-core
```

Or via npm:

```
npm install --save laconia-core
```

To fully understand how Laconia's Dependency Injection works, let's have a look into an
example below. _This is not a running code as there are a lot of code that have been trimmed down,
full example can be found in the acceptance test: [src](packages/laconia-acceptance-test/src/place-order.js)
and [unit test](packages/laconia-acceptance-test/test/place-order.spec.js)_.

Lambda handler code:

```js
// Objects creation, a function that returns an object
const instances = ({ env }) => ({
  orderRepository: new DynamoDbOrderRepository(env.ORDER_TABLE_NAME),
  idGenerator: new UuidIdGenerator()
});

// Handler function, which do not have any object instantiations
module.exports.handler = laconia(
  // Instances made available via destructuring
  async ({ event, orderRepository, idGenerator }) => {
    await orderRepository.save(order);
  }
).register(instances);
```

Unit test code:

```js
const handler = require("../src/place-order").handler;

// Creates a mock Laconia context
beforeEach(() => {
  lc = {
    orderRepository: {
      save: jest.fn().mockReturnValue(Promise.resolve())
    }
  };
});

// Runs handler function without worrying about the objects creation
it("should store order to order table", async () => {
  await handler.run(lc);

  expect(lc.orderRepository.save).toBeCalledWith(
    expect.objectContaining(order)
  );
});
```

Note that as you have seen so far, Laconia is not aiming to become a comprehensive
DI framework hence the need of you handle the instantiation of all of the objects by yourself.
It should theoretically be possible to integrate Laconia to other more comprehensive
NodeJS DI framework but it has not been tested.

### LaconiaContext

Laconia provides a one stop location to get all of the information you need for your Lambda
function execution via `LaconiaContext`. In a nutshell, LaconiaContext is just an object that
contains all of those information by using object property keys, hence you can destructure it
to get just the information you need.

#### AWS Event and Context

When Laconia is adopted, the handler function signature will change. Without Laconia,
your handler signature would be `event, context, callback`. With Laconia, your handler
signature would be `laconiaContext`. The `event` and `context` are always available in LaconiaContext.
`callback` is not made available as this should not be necessary anymore when you are
using Node 8, just `return` the value that you want to return to the caller inside the handler function.

Example:

```js
laconia(({ event, context }) => true);
```

#### Laconia helpers

LaconiaContext contains some helpers that you can use by default. They are accessible
via the following keys:

* `invoke`
* `recurse`

The details of these helpers are covered in the different section of this documentation.

Example:

```js
laconia(({ invoke, recurse }) => true);
```

#### Environment Variables

It is very common to set environment variables for your Lambda functions.
This is normally accessed via `process.env`. Unit testing a Lambda function that
uses `process.env` is awkward, as you have to modify the `process` global variable and remember
to remove your change so that it doesn't affect other test.

For better unit testability, LaconiaContext contains the environment variables
with key `env`.

Example:

```js
laconia(({ env }) => true);
```

### API

#### `laconia(fn)`

* `fn(laconiaContext)`
  * This `Function` is called when your Lambda is invoked
  * Will be called with `laconiaContext` object, which can be destructured to `{event, context}`

Example:

```js
// Simple return value
laconia(() => "value");

// Return a promise and 'value' will be returned to the Lambda caller
laconia(() => Promise.resolve("value"));
```

#### `register(instanceFn)`

Registers objects into LaconiaContext. Objects registered here will be made
available in the Lambda function execution.

* `instanceFn(laconiaContext)`
  * This `Function` is called when your Lambda is invoked
  * An object which contains the instances to be registered must be returned

Example:

```js
// Register an object with key 'service'
laconia(({ service }) => service.call()).register(() => ({
  service: new SomeService()
}));
```

#### `run(laconiaContext)`

Runs Lambda handler function with the specified `laconiaContext` and bypasses
the LaconiaContext registration step. This function should only be used in a
unit test.

* `laconiaContext`
  * A plain object that should represent the LaconiaContext to be used in the function execution

```js
// Runs a handler function with a LaconiaContext that contains a mock service object.
// `SomeService` will not be instantiated
laconia(({ service }) => service.call())
  .register(() => ({
    service: new SomeService()
  }))
  .run({
    service: jest.mock()
  });
```

## Lambda Invocation

Laconia provides more predictable user experience of invoking other Lambda by:

* Automatically stringifying the JSON payload
* Throwing an error when FunctionError is returned instead of failing silently
* Throwing an error when statusCode returned is not expected

An `invoke` function is injected to LaconiaContext by default, or you can
import it manually.

```js
const { laconia } = require("laconia-core");

module.exports.handler = laconia(async ({ invoke }) => {
  // Waits for Lambda response before continuing
  await invoke("function-name").requestResponse({ foo: "bar" });
  // Invokes a Lambda and not wait for it to return
  await invoke("function-name").fireAndForget({ foo: "bar" });
});
```

### API

#### `invoke(functionName, options)`

* `functionName` specifies the Lambda function name that will be invoked
* `options`:
  * `lambda = new AWS.Lambda()`
    * _Optional_
    * Set this option if there's a need to cutomise the AWS.Lambda instantation
    * Used for Lambda invocation

Example:

```js
// Customise AWS.Lambda instantiation
invoke("name", {
  lambda: new AWS.Lambda({ apiVersion: "2015-03-31" })
});
```

#### `requestResponse(payload)`

Synchronous Lambda invocation.

* `payload`
  * The payload used for the Lambda invocation

Example:

```js
invoke("fn").requestResponse({ foo: "bar" });
```

#### `fireAndForget(payload)`

Asynchronous Lambda invocation.

* `payload`
  * The payload used for the Lambda invocation

Example:

```js
invoke("fn").fireAndForget({ foo: "bar" });
```

## Recursion

An instantiated `recurse` function is injected to LaconiaContext by default, or
you can import it manually from laconia-core.

```js
const { laconia } = require("laconia-core");

module.exports.handler = laconia(({ event, recurse }) => {
  if (event.input !== 3) {
    return recurse({ input: event.input + 1 });
  }
});
```

### API

#### `recurse(payload = {})`

* This `Function` can be called to recurse the Lambda
* `payload` will be made available in the invoked Lambda's `event` object
* Do not call this function to stop the recursion

Example:

```js
laconia(({ event, recurse }) => {
  if (event.input !== 3) {
    return recurse({ input: event.input + 1 });
  }
});
```
