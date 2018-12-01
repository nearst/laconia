# @laconia/api

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia API - Converts API Gateway events into express-like req and res objects

Instead of receiving API Gateway event object, your handler function will receive the familiar
express-like `req` and `res` objects. Laconia API encourages you to have single purpose functions
to handle API Gateway events hence delegating all of the routing functions to API Gateway and
keep the Lambda dumb.

Laconia API is using [`lambda-api`](https://github.com/jeremydaly/lambda-api) under the hood.

## Install

```
npm install --save @laconia/api
```

## Usage

```js
const laconia = require("@laconia/api");

const handler = async ({ req, res }, { orderStream }) => {
  const orderId = req.pathParameters.id; // API Gateway path parameter is available
  await orderStream.send({ eventType: "accepted", orderId }); // Interacts with registered dependency
  console.log(req.body); // Parses JSON automatically when content-type is application/json
  return res.status(200).send({ status: "ok" }); // JSON Stringifies response body automatically
};

module.exports.handler = laconiaApi(handler).register(instances);
```

# API

## `laconiaApi(fn)`

* `fn({req, res}, laconiaContext)`
  * This `Function` is called when your Lambda is invoked
  * Will be called with `laconiaContext` object, which can be destructured to retrieve your dependencies
  * To see what methods are available in `req` and `res`, head over to [lambda-api's documentation](https://github.com/jeremydaly/lambda-api).

Example:

```js
// Simple return value
const handler = ({ res }) => res.send(200);

laconiaApi(handler);
```
