# @laconia/test

[![CircleCI](https://circleci.com/gh/laconiajs/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/laconiajs/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/laconiajs/laconia/badge.svg?branch=master)](https://coveralls.io/github/laconiajs/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flaconiajs%2Flaconia.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flaconiajs%2Flaconia?ref=badge_shield)
[![Known Vulnerabilities](https://snyk.io/test/github/laconiajs/laconia/badge.svg)](https://snyk.io/test/github/laconiajs/laconia)
[![Greenkeeper badge](https://badges.greenkeeper.io/laconiajs/laconia.svg)](https://greenkeeper.io/)

> 🛡️ Laconia Test — Makes Lambda integration testing a breeze

Integration test is a very important layer to be tested in the Serverless Architecture,
due to the nature of its ecosystem dependencies. Laconia Test package aims to make integration
test easy especially when you are testing your system end to end.

## Features

- Invoke your Lambda under test
- Augment invocation error stacktrace to include Lambda error stacktrace
- Console.log your Lambda logs on invocation error
- Spy on indirect Lambda invocations

The example of an automatic Lambda logs and augmented stacktrace print out when
your Lambda is invoked with @laconia/test:

```js
...
● order flow › error scenario › capture-card-payment › should throw an error when paymentReference is not defined

  expect(function).toThrow(string)

  Expected the function to throw an error matching:
    "paymentReference is not required"
  Instead, it threw:
    Error in laconia-acceptance-node8-capture-card-payment: paymentReference is required
        62 |       if (data.FunctionError === "Handled") {
      > 63 |         throw new HandledInvokeLaconiaError(
            |               ^
        64 |           this.functionName,

        at LambdaInvoker._invoke (../laconia-core/src/invoke.js:63:15)
// - Augmented stacktrace
        Caused by an error in laconia-acceptance-node8-capture-card-payment Lambda:
        at handler (../../../../../../var/task/src/capture-card-payment.js:6:11)
        at ../../../../../../var/task/node_modules/laconia-test/src/spy.js:9:41
        at laconia (../../../../../../var/task/node_modules/laconia-core/src/laconia.js:12:28)
```

```
...
// - Lambda log printed automatically
console.log ../laconia-test/src/LaconiaTester.js:14
  laconia-acceptance-node8-capture-card-payment Lambda logs:
  START RequestId: 5e906334-9826-11e8-98c4-3987e5661f37 Version: $LATEST
  2018-08-04T20:38:40.266Z	5e906334-9826-11e8-98c4-3987e5661f37	{"errorMessage":"paymentReference is required","errorType":"Error","stackTrace":["..."]}
  END RequestId: 5e906334-9826-11e8-98c4-3987e5661f37
...
```

## FAQ

Check out [FAQ](https://github.com/ceilfors/laconia#faq)

## Install

```
npm install --save @laconia/test
```

## Invocation

See `@laconia/invoker`'s documentation for more details on usage and API. The arugments are exactly the same.

### Usage

```js
await laconiaTest("process-card-payments").fireAndForget();
await laconiaTest("capture-card-payment").requestResponse({
  paymentReference: "abc"
});
```

## Spy

### Usage

Lambda configuration:

- Set LACONIA_TEST_SPY_BUCKET environment variable. This is required as the invocation
  records are stored in an S3 bucket. The bucket must already be created.

IAM permission configuration:

- Permissions must be updated to allow Lambda and your test environment to read and write to the configured S3 bucket.

Lambda handler code:

```js
const laconia = require("@laconia/core");
const { spy } = require("@laconia/test");

const app = async ({ event }) => {};

exports.handler = laconia(spy(app)).register(spy.instances());
```

Test code:

```js
const laconiaTest = require("@laconia/test");

it("should capture all card payments", async () => {
  await laconiaTest("process-card-payments").fireAndForget();
  const captureCardPayment = laconiaTest("capture-card-payment", {
    spy: {
      bucketName: "spy"
    }
  });
  await captureCardPayment.spy.waitForTotalInvocations(10);
  const invocations = await captureCardPayment.spy.getInvocations();
  const capturedPaymentReferences = invocations
    .map(t => t.event.paymentReference)
    .sort();
  expect(capturedPaymentReferences).toEqual(expectedPaymentReferences);
});
```

### API

#### `spy(app)`

Enable spying feature in a Lambda.

- `app`
  - The laconia application you are spying

Example:

```js
const app = async ({ event }) => {};

laconia(spy(app)).register(spy.instances());
```

#### `spy.instances`

To be used to register instances that will used for spy function to work.

Example:

```js
const app = async ({ event }) => {};

laconia(spy(app)).register(spy.instances());
```

#### `laconiaTest(functionName, { spy })`

- `functionName` specifies the Lambda function name that will be invoked
- `options`:
  - `lambda = new AWS.Lambda()`
    - _Optional_
    - Set this option if there's a need to customise its instantiation
    - USed for S3 interaction
  - `spy`:
    - `bucketName` specifies the bucket name where the invocation records are stored
    - `s3 = new AWS.S3()`
      - _Optional_
      - Set this option if there's a need to customise its instantiation
      - USed for S3 interaction

Example:

```js
laconiaTest("capture-card-payment", {
  spy: {
    bucketName: "spy",
    s3: new AWS.S3()
  }
});
```

#### `laconiaTest.spy`

The spy object that can be used to get the list of invocations done
in a Lambda.

#### `laconiaTest.spy.clear()`

Clear spy invocation records in the S3 bucket configured.

#### `laconiaTest.spy.waitForTotalInvocations(totalInvocations)`

Waits until the lambda under test has been invoked for `totalInvocations` times

- `totalInvocations`
  - The number of invocation laconiaTest will wait to

#### `laconiaTest.spy.getInvocations()`

Returns an array of invocation records. Only `event` is currently recorded.

Example:

```js
it("should capture all card payments", async () => {
  const captureCardPayment = laconiaTest(name("capture-card-payment"), {
    spy: {
      bucketName: "spy"
    }
  });
  const invocations = await captureCardPayment.spy.getInvocations();
  console.log(invocations.map(t => t.event));
});
```
