# @laconia/xray

[![CircleCI](https://circleci.com/gh/laconiajs/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/laconiajs/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/laconiajs/laconia/badge.svg?branch=master)](https://coveralls.io/github/laconiajs/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flaconiajs%2Flaconia.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flaconiajs%2Flaconia?ref=badge_shield)
[![Known Vulnerabilities](https://snyk.io/test/github/laconiajs/laconia/badge.svg)](https://snyk.io/test/github/laconiajs/laconia)
[![Greenkeeper badge](https://badges.greenkeeper.io/laconiajs/laconia.svg)](https://greenkeeper.io/)

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
