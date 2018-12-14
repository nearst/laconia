# @laconia/middleware-serverless-plugin-warmup

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Middleware for serverless-plugin-warmup — Short circuit Lambda run when it's called by serverless-plugin-warmup

## Install

```
npm install --save @laconia/middleware-serverless-plugin-warmup
```

## Usage

```js
const warmup = require("@laconia/middleware-serverless-plugin-warmup")();
const laconia = require("@laconia/core");

const handler = (event, laconiaContext) => {};
const app = laconia(handler);

exports.handler = warmup(app);
```
