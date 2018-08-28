# laconia-invoke

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Invoke — Invokes Lambdas like regular functions

## Features

* **Convention over configuration**: Set environment variables and you are good to go
* **Predictable user experience**: Avoid common Lambda invocation programming error

Here are the user experience improvements that laconia-invoke does for you:

* Automatically stringifying JSON request payload and parsing JSON response payload
* Throwing an error when FunctionError is returned instead of failing silently
* Augmenting stacktrace in the FunctionError thrown based on the stacktrace returned by Lambda invocation
* Set the FunctionError object's name and message thrown based on the error returned by Lambda invocation
* Throwing an error when statusCode returned is not expected

## Install

```
npm install --save laconia-invoke
```

## Convention over configuration

One of the philosophy of Laconia is convention over configuration. You can
use `laconia-invoke` by simply setting environment variables and the
creation of `invoke` function will be done automagically and injected
to your `LaconiaContext`.

The environment variable that you set must follow this convention:

```yml
LACONIA_INVOKE_VARIABLE_NAME: lambdaName
```

`laconia-invoke` will scan all environment variables that start with LACONIA_INVOKE and
inject the `invoke` instances to `LaconiaContext`. The name of the instances will be extracted from the environment variable name, then
converted to camel case. The instance you'll get in your `LaconiaContext` from the above configuration will be
`variableName`.

Example usage:

Set your lambda environment variable:

```yml
LACONIA_INVOKE_CALL_CAPTURE_CARD_PAYMENT_LAMBDA: capture-card-payment
```

Once the environment variable is set, you will be able to invoke `capture-card-payment` lambda by
registering the `envVarInstances` function
provided by `laconia-invoke`:

```js
const invoke = require("laconia-invoke");
const laconia = require("laconia-core");

const handler = async ({ captureCardPaymentLambda }) => {
  await captureCardPaymentLambda.requestResponse();
};

module.exports.handler = laconia(handler).register(invoke.envVarInstances);
```

### API

#### `invoke.envVarInstances`

Scans environment variables set in the current Lambda and automatically
creates instances of `invoke`. To be used together with `laconia-core`.

Example:

```js
const invoke = require("laconia-invoke");
const laconia = require("laconia-core");

const handler = async ({ captureCardPaymentLambda }) => {
  /* logic */
};

module.exports.handler = laconia(handler).register(invoke.instances);
```

## Manual instantiation

An instance of `invoke` can be created manually when the CoC style provided
does not satisfy your need.

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

## Invocations

### API

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
