# laconia-test

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Test — Makes Lambda integration testing a breeze

Integration test is a very important layer to be tested in the Serverless Architecture,
due to the nature of its ecosystem dependencies. Laconia Test package aims to make integration
test easy especially when you are testing your system from end to end.

## Features

* Invoke your Lambda under test easily
* Console.log your Lambda logs and stacktrace on invocation error
* Spy on indirect Lambda invocations

The example of an automatic Lambda logs and augmented stacktrace print out:

```js
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
// Augmented stacktrace
          Caused by an error in laconia-acceptance-node8-capture-card-payment Lambda:
          at handler (../../../../../../var/task/src/capture-card-payment.js:6:11)
          at ../../../../../../var/task/node_modules/laconia-test/src/spy.js:9:41
          at laconia (../../../../../../var/task/node_modules/laconia-core/src/laconia.js:12:28)

...
// Lambda log printed automatically
  console.log ../laconia-test/src/LaconiaTester.js:14
    laconia-acceptance-node8-capture-card-payment Lambda logs:
    START RequestId: 5e906334-9826-11e8-98c4-3987e5661f37 Version: $LATEST
    2018-08-04T20:38:40.266Z	5e906334-9826-11e8-98c4-3987e5661f37	{"errorMessage":"paymentReference is required","errorType":"Error","stackTrace":["handler (/var/task/src/capture-card-payment.js:6:11)","/var/task/node_modules/laconia-test/src/spy.js:9:41","laconia (/var/task/node_modules/laconia-core/src/laconia.js:12:28)","<anonymous>"]}
    END RequestId: 5e906334-9826-11e8-98c4-3987e5661f37
```

## FAQ

Check out [FAQ](https://github.com/ceilfors/laconia#faq)

## Install

```
npm install --save laconia-test
```

## Invocation

See `laconia-core` documentation for more details on usage and API.

### Usage

```js
await laconiaTest("process-card-payments").fireAndForget();
await laconiaTest("capture-card-payment").requestResponse({
  paymentReference: "abc"
});
```

### API

#### laconiaTest()

## Spy

### Usage

In your Lambda:

```js
const { laconia } = require("laconia-core");
const { spy } = require("laconia-test");

const handler = async ({ event }) => {};

module.exports.handler = laconia(spy(handler)).register(spy.instances);
```

In your test:

```js
const captureCardPayment = laconiaTest(name("capture-card-payment"), {
  spy: {
    bucketName: name("tracker")
  }
});
captureCardPayment.spy.clear();
captureCardPayment.spy.waitForTotalInvocations(10);
captureCardPayment.spy.getInvocations();
```

### API

#### laconiaTest(functionName, options)

#### spy

#### spy.clear()

#### spy.waitForTotalInvocations()

#### spy.getInvocations()
