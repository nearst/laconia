# @laconia/middleware-lambda-warmer

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia Middleware for Lambda Warmer — Integrates Lambda with lambda-warmer

## Install

```
npm install --save @laconia/middleware-lambda-warmer
```

## Usage

```js
const lambdaWarmer = require("@laconia/middleware-lambda-warmer")();
const laconia = require("@laconia/core");

const app = (event, laconiaContext) => {};
const handler = laconia(app);

exports.handler = lambdaWarmer(handler);
```
