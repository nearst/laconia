# @laconia/invoker

[![CircleCI](https://circleci.com/gh/laconiajs/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/laconiajs/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/laconiajs/laconia/badge.svg?branch=master)](https://coveralls.io/github/laconiajs/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flaconiajs%2Flaconia.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flaconiajs%2Flaconia?ref=badge_shield)
[![Known Vulnerabilities](https://snyk.io/test/github/laconiajs/laconia/badge.svg)](https://snyk.io/test/github/laconiajs/laconia)
[![Greenkeeper badge](https://badges.greenkeeper.io/laconiajs/laconia.svg)](https://greenkeeper.io/)

> 🛡️ Laconia Invoker — Invokes Lambdas like regular functions

## Features

- **Convention over configuration**: Set environment variables and you are good to go
- **Predictable user experience**: Avoid common Lambda invocation programming error

Here are the user experience improvements that @laconia/invoker does for you:

- Automatically stringifying JSON request payload and parsing JSON response payload
- Throwing an error when FunctionError is returned instead of failing silently
- Augmenting stacktrace in the FunctionError thrown based on the stacktrace returned by Lambda invocation
- Set the FunctionError object's name and message thrown based on the error returned by Lambda invocation
- Throwing an error when statusCode returned is not expected

## Install

```
npm install --save @laconia/invoker
```

## Convention over configuration

One of the philosophy of Laconia is convention over configuration. You can
use `@laconia/invoker` by simply setting environment variables and the
creation of `invoker` will be done automagically and injected
to your `LaconiaContext`.

The environment variable that you set must follow this convention:

```yml
LACONIA_INVOKER_VARIABLE_NAME: lambdaName
```

`@laconia/invoker` will scan all environment variables that start with LACONIA_INVOKER and
inject the `invoker` instances to `LaconiaContext`. The name of the instances will be extracted from the environment variable name, then
converted to camel case. The instance you'll get in your `LaconiaContext` from the above configuration will be
`variableName`.

Example usage:

Set your lambda environment variable:

```yml
LACONIA_INVOKER_CALL_CAPTURE_CARD_PAYMENT_LAMBDA: capture-card-payment
```

Once the environment variable is set, you will be able to invoke `capture-card-payment` lambda by
registering the `envVarInstances` function
provided by `@laconia/invoker`:

```js
const invoker = require("@laconia/invoker");
const laconia = require("@laconia/core");

const app = async ({ captureCardPaymentLambda }) => {
  await captureCardPaymentLambda.requestResponse();
};

exports.handler = laconia(app).register(invoker.envVarInstances());
```

### API

#### `invoker.envVarInstances`

Scans environment variables set in the current Lambda and automatically
creates instances of `invoker`. To be used together with `@laconia/core`.

Example:

```js
const invoker = require("@laconia/invoker");
const laconia = require("@laconia/core");

const app = async ({ captureCardPaymentLambda }) => {
  /* logic */
};

exports.handler = laconia(app).register(invoker.envVarInstances());
```

## Manual instantiation

An instance of `invoker` can be created manually when the CoC style provided
does not satisfy your need.

### API

#### `invoker(functionName, lambda, options)`

- `functionName` specifies the Lambda function name that will be invoked
- `lambda` specifies the Lambda instance that will be used to invoke the lambda

Example:

```js
invoker("name", new AWS.Lambda({ apiVersion: "2015-03-31" }));
```

## Invocations

### API

#### `requestResponse(payload)`

Synchronous Lambda invocation.

- `payload`
  - The payload used for the Lambda invocation

Example:

```js
invoker("fn").requestResponse({ foo: "bar" });
```

#### `fireAndForget(payload)`

Asynchronous Lambda invocation.

- `payload`
  - The payload used for the Lambda invocation

Example:

```js
invoker("fn").fireAndForget({ foo: "bar" });
```
