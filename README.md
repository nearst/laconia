<p align="center">
  <img alt="Laconia" src="docs/shield.png">
</p>

# Laconia

[![CircleCI](https://img.shields.io/circleci/project/github/ceilfors/laconia/master.svg)](https://circleci.com/gh/ceilfors/laconia)
[![Coverage Status](https://coveralls.io/repos/github/ceilfors/laconia/badge.svg?branch=master)](https://coveralls.io/github/ceilfors/laconia?branch=master)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)

> 🛡️ Laconia — Micro AWS Lambda framework

## Modules

The following modules are available as NPM packages:

* laconia-core: Micro dependency injection framework. Also provides help on Lambda invocations.

  [Documentation](packages/laconia-core/README.md)

* laconia-batch: Reads large number of records without time limit.

  [Documentation](packages/laconia-batch/README.md)

## FAQ

1.  I already am using another framework like Serverless Framework or SAM, why should I use laconia?

    Tools like Serverless Framework or SAM are more focused on helping the
    build and deployment of your application. Laconia however is more focused on
    how you craft your application. In fact, both tools can be used together and
    can be seen in action in [laconia's acceptance test](packages/laconia-acceptance-test).

## License

[Apache License 2.0](LICENSE)
