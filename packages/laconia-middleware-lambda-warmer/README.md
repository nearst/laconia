# @laconia/middleware-lambda-warmer

[![CircleCI](https://circleci.com/gh/laconiajs/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/laconiajs/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/laconiajs/laconia/badge.svg?branch=master)](https://coveralls.io/github/laconiajs/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Flaconiajs%2Flaconia.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Flaconiajs%2Flaconia?ref=badge_shield)
[![Known Vulnerabilities](https://snyk.io/test/github/laconiajs/laconia/badge.svg)](https://snyk.io/test/github/laconiajs/laconia)
[![Greenkeeper badge](https://badges.greenkeeper.io/laconiajs/laconia.svg)](https://greenkeeper.io/)

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
