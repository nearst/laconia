# @laconia/xray

> 🛡️ Laconia X-Ray - Enables X-Ray integration to Laconia

See our [website](https://laconiajs.io) for documentation and API references.

## Install

```
npm install --save @laconia/xray
```

## Usage

@laconia/xray postProcessor will scan through all of the instances registered in
`LaconiaContext` and call `AWSXRay.captureAWSClient()` to it.

Example:

```js
const laconia = require("@laconia/core");
const xray = require("@laconia/xray");

exports.handler = laconia(app).postProcessor(xray.postProcessor());
```

## API

#### `xray.postProcessor`

Calls `AWSXRay.captureAWSClient()` to all registered AWS service objects.

Example:

```js
const laconia = require("@laconia/core");
const xray = require("@laconia/xray");

exports.handler = laconia(app).postProcessor(xray.postProcessor());
```
