# @laconia/adapter-api

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Adapter API - Converts API Gateway Proxy events into your application input

## Install

```
npm install --save @laconia/adapter-api
```

## Usage

```js
const laconia = require("@laconia/core");
const apigateway = require("@laconia/adapter-api").apigateway({ inputType: "params" });

// id is made available either from pathParameters or queryStringparameters
const app = async ({ id }, { orderStream }) => {
  await orderStream.send({ eventType: "accepted", orderId: id }); // Interacts with registered dependency
  return { status: "ok" }; // JSON Stringifies response body automatically
};

exports.handler = laconia(apigateway(app)).register(instances);
```

## Application ports

There are two ways your application can be called by @laconia/adapter-api adapter:

* `(input, dependencies)` - This is the default
* `(input, inputHeaders, dependencies)` - Headers parameter will be included when includeInputHeaders is set to true

`inputHeaders` parameter contains the following information:

* The HTTP request headers both in its original format and canonical format i.e. `Content-Type` and `content-type`.
* If inputType is `body`, it will also contain the API Gateway queryStringParameters and pathParameters.

## Supported input types

@laconia/adapter-api adapter supports the following the input types:

* `body`

  Translates the event body into your application input. According to the content type, the body will be parsed accordingly.

  In a scenario where you require pathParameters or queryStringParameters as well, you can set the `includeInputHeaders` options to true, and those parameters will be made available in the `inputHeaders` parameter.

* `params`

  Translates the query parameters into your application input. This is a combination of both path parameters and query string parameters

  The parsed request `body` is available with property `body`.

The HTTP request body is parsed according to the Content-Type header. The currently supported Content-Types are:

* application/x-www-form-urlencoded
* application/json

When the Content-Type received is not supported, @laconia/adapter-api will not attempt to parse the request body.

## Supported output types

Your application can return the following output:

* Object
  * Response Content-Type will be set to application/json
  * Your output will automatically be JSON stringified
* String
  * Response Content-Type will be set to text/plain
* Number
  * Response Content-Type will be set to text/plain
  * Your output will automatically be JSON stringified
* Promise that wraps any of the above
* Buffer / Stream - Unsupported yet

## Error handling

@laconia/adapter-api encourages your application not to have any HTTP knowledge. It supports a simple mapping from error name thrown from your application, to the response that it should return.

The following example returns statusCode 400 when ValidationError is returned.

```js
const apigateway = require("@laconia/adapter-api").apigateway({
  errorMappings: {
    "Validation.*": () => ({ statusCode: 400 })
  }
});

exports.handler = laconia(apigateway(app));
```

## API

### `apigateway(options)`

* `options`:
  * `inputType = "body"`
    * Supported values are: `body`, `params`
    * Determines what should the application receive as an input
  * `includeInputHeaders = false`
    * Set to true to receive `inputHeaders` parameter in your application
  * `responseStatusCode = 200`
    * The status code that the Lambda should return in successful execution
  * `responseAdditionalHeaders`
    * Set additional headers here, such as CORS headers that you need your Lambda to return
  * `errorMappings`
    * Supports a `Map` or `Object`. Use Map if sequence of mapping is crucial.
    * The error map that the adapter should use when the application throws an error
    * Response code will be 500 when no mapping is matched

Example:

```js
apigateway({ inputType: "params", includeInputHeaders = true });

// Error mapping
// - Response Content-Type will be set to applicaiton/json
// - Body will be JSON stringified
// - Status code will be 400
// - Additional response headers will be returned
apigateway({
  errorMappings: {
    "Validation.*": error => ({
      body: { foo: error.message },
      headers: { "Access-Control-Max-Age": 123 },
      statusCode: 400
    })
  }
});

// Additional headers - CORS
apigateway({
  additionalHeaders: {
    "Access-Control-Allow-Origin": "foo"
  }
});
```
