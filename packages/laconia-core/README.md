# laconia-core

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia — Micro AWS Lambda framework

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

Create a new js file and the following capabilities will be made
available for you:

```js
const { laconia, recurse, invoke } = require('laconia-core')
```

The `laconia` function will be the main entry of your Lambda execution. It wraps the
original Lambda signature so that you won't forget to call AWS
Lambda's `callback` anymore.

To respond to your Lambda caller, you can do the following:

* return object: This will used for calling Lambda `callback`
* return Promise: The promise will be resolved/rejected, and `callback` will called appropriately
* throw error: The error object will be used for calling Lambda `callback`
* return `recurse(payload)` function: Recurse the currently running Lambda
* -_in progress_- return `send(statusCode, data)` function: Return an API Gateway Lambda Proxy Integration response
* -_in progress_- return `sendError(statusCode, error)` function: Return an API Gateway Lambda Proxy Integration response

```js
const { laconia } = require('laconia-core')

module.exports.handler = laconia(() => 'hello')
```

### API

#### `laconia(fn)`

* `fn(laconiaContext)`
  * This `Function` is called when your Lambda is invoked
  * Will be called with `laconiaContext` object, which can be destructured to `{event, context}`

Example:

```js
// Simple return value
laconia(() => 'value')

// Return a promise and 'value' will be returned to the Lambda caller
laconia(() => Promise.resolve('value'))
```

## Lambda Invocation

Laconia provides more predictable user experience of invoking other Lambda by:

* Automatically stringifying the JSON payload
* Throwing an error when FunctionError is returned instead of failing silently
* Throwing an error when statusCode returned is not expected

```js
const { invoke } = require('laconia-core')

// Waits for Lambda response before continuing
await invoke('function-name').requestResponse({ foo: 'bar' })
// Invokes a Lambda and not wait for it to return
await invoke('function-name').fireAndForget({ foo: 'bar' })
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
invoke('name', {
  lambda: new AWS.Lambda({ apiVersion: '2015-03-31' })
})
```

#### `requestResponse(payload)`

Synchronous Lambda invocation.

* `payload`
  * The payload used for the Lambda invocation

Example:

```js
invoke('fn').requestResponse({ foo: 'bar' })
```

#### `fireAndForget(payload)`

Asynchronous Lambda invocation.

* `payload`
  * The payload used for the Lambda invocation

Example:

```js
invoke('fn').fireAndForget({ foo: 'bar' })
```

## Recursion

To be used together with `laconia` function to recurse the currently running Lambda.

```js
const { laconia, recurse } = require('laconia-core')

module.exports.handler = laconia(({ event }) => {
  if (event.input !== 3) {
    return recurse({ input: event.input + 1 })
  }
})
```

### API

#### `recurse(payload = {})`

* This `Function` can be called to recurse the Lambda
* `payload` will be made available in the invoked Lambda's `event` object
* Do not call this function to stop the recursion

Example:

```js
const { laconia, recurse } = require('laconia-core')
laconia(({ event }) => {
  if (event.input !== 3) {
    return recurse({ input: event.input + 1 })
  }
})
```
