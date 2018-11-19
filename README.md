<p align="center">
  <img alt="Laconia" src="docs/logo/png/2_vertical@1x.png">
</p>

# Laconia

[![CircleCI](https://circleci.com/gh/ceilfors/laconia/tree/master.svg?style=shield)](https://circleci.com/gh/ceilfors/laconia/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia — Micro AWS Lambda framework

_Laconia is still in active development, please ⭐ the project to support its development!_

## Features

Laconia shields you from common AWS Lambda problems so that you can regain focus back
on developing your application.

* **Non intrusive**: Switch to other technologies without significant application code change
* **Clean**: Enables and encourages good coding practices, such as by supporting Dependency Injection
* **Lightweight**: Features are modularised, so you can use just what you need and keep your Lambdas performant
* **Focused**: Designed specifically for AWS Lambda and Node.js, hence there is no unnecessary layer of abstraction
* **Versatile**: Compatible and tested to work with Serverless Framework. Can also be used with or without other frameworks.
* **Quality assured**: Ultra high test coverage

## Documentation

Laconia's documentation is captured in every modules README. To understand more about what it does, start from
@laconia/core's README.

## Modules

* [@laconia/core](packages/laconia-core/README.md): Micro dependency injection framework
* [@laconia/invoker](packages/laconia-invoker/README.md): Invokes Lambdas like regular functions
* [@laconia/config](packages/laconia-config/README.md): Externalizes application secret and configuration
* [@laconia/event](packages/laconia-event/README.md): Converts AWS events into non-AWS or humane format
* [@laconia/batch](packages/laconia-batch/README.md): Reads large number of records without time limit
* [@laconia/xray](packages/laconia-xray/README.md): Enables X-Ray integration to Laconia
* [@laconia/test](packages/laconia-test/README.md): Makes Lambda integration testing a breeze

## FAQ

1.  I already am using another framework like Serverless Framework or SAM, why should I use laconia?

    Tools like Serverless Framework or SAM are more focused on helping the
    build and deployment of your application. Laconia however is more focused on
    how you craft your application. In fact, both tools are designed to be used together and
    can be seen in action in [laconia's acceptance test](packages/laconia-acceptance-test).

## License

[Apache License 2.0](LICENSE)
