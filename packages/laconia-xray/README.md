# @laconia/xray

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia X-Ray - Enables X-Ray integration to Laconia

## Install

```
npm install --save @laconia/xray
```

## Usage

@laconia/xray postProcessor will scan through all of the instances registered in `LaconiaContext`
and call `AWSXRay.captureAWSClient()` to it.

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
