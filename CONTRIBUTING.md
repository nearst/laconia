# Introduction

First off, thank you for considering contributing to Laconia. It's people like
you that make Laconia such a great framework. Laconia is still early in its
infancy and it is no way close to the vision I have, so I would definitely
invite contributors and maintainers. If this section is not helping what you are
trying to do, please do have a chat with us in
[gitter](https://gitter.im/laconiajs/laconia), we won't bite at all, and don't
be shy!

All members of our community are expected to follow our
[Code of Conduct](CODE_OF_CONDUCT.md). In summary, "Don't be a jerk" in this
space and you will help grow a friendly community amongst passionate people.

## Your first contribution

These are some of the contribution you can help with, and not limited to:

- review a [pull request](https://github.com/laconiajs/laconia/pulls)
- file an [issue](https://github.com/laconiajs/laconia/issues)
- improve the [documentation](https://github.com/laconiajs/website)
- write a tutorial or blog post. Look out for `blog` label.

Especially for support questions, we would appreciate it if you don't use GitHub
issue tracker. This is so that when other people are encountering a similar
issue, it will be beneficial for them to be able to come to the same answer. You
can do the following to ask support questions:

- Ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/laconiajs).
  At the point of writing this document, the Stack Overflow tag has not been
  created yet, so please ping us in
  [gitter](https://gitter.im/laconiajs/laconia) if you need help. If you don't
  get answeres in Stack Overflow, please also ping us in gitter!
- Alternatively, talk to us in [gitter](https://gitter.im/laconiajs/laconia). To
  help other people discover your answer, you can always
  [self-answer](https://stackoverflow.com/help/self-answer) your own question in
  Stack Overflow after.

## Your first pull request

Working on your first pull request? You can learn how from this _free_ series:

> [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

We have a list of [issue GitHub](https://github.com/laconiajs/laconia/issues),
whether it's a bug or feature. Look out for `help-wanted` or `good first issue`
label.

At this point, you're ready to make your changes! Feel free to ask for help;
everyone is a beginner at first.

# How to submit a pull request

We love pull requests! Here are some guide:

1. First, ensure that no one else is actively working on the issue.

2. The project is using `standard` and `prettier` for linter and code style.
   They are quite strict, so it will be painful if you are fixing the errors
   manually. The project contains Visual Studio Code configuration under
   `.vscode`. These settings will ensure that code style and standard are
   automatically fixed for you. It also contains a
   [list of extensions that we recommend](https://code.visualstudio.com/docs/editor/extension-gallery#_workspace-recommended-extensions).

3. We love tests. Tests ensure that our releases are safe and don't break our
   users code. There are multiple level of tests and they are outlined below. We
   will require unit tests to be the minimum, especially for new APIs, we would
   love to have additional acceptance tests. As always, do reach out if you need
   help!

   - TypeScript type tests

     - Example:
       [here](https://github.com/laconiajs/laconia/blob/master/packages/laconia-core/test/types/index.ts)
     - Command: Included in `npm test`

   - Unit tests. Your test will fail if the new code doesn't have full test
     coverage. Please don't be intimidated by this, and we are here to support
     your pull request if you can't figure out how to test a particular code.

     - Example:
       [here](https://github.com/laconiajs/laconia/blob/master/packages/laconia-core/test/laconia.spec.js).
     - Command: Included in `npm test`. If you love TDD, `npm run test:watch`

   - Integration tests. These are the test that involve external process, like
     local DynamoDB

     - Example:
       [here](https://github.com/laconiajs/laconia/tree/master/packages/laconia-batch/integration-test)
     - Command: Included in `npm test`

   - Acceptance tests. These tests simulate almost real world scenario and are
     running in the cloud. It's okay if you don't want to run these as it will
     involve some cost in AWS.

     - Example:
       [here](https://github.com/laconiajs/laconia/tree/master/packages/laconia-acceptance-test)
     - Command: `npm run test:acceptance`, or included in `npm run test:all`

4. For API changes, we would encourage you to design the API with us first
   before starting to implement them. Laconia's
   [documentation](https://github.com/laconiajs/website) must be updated too!

5. Once you are done implementing, file the pull request!

# Code review process

There isn't any special process at the moment for code reviews. Expect us to
reply within 1 week, and we'll let you know if we're struggling to cope or
haven't got the time to review them yet! We are all friendly, so don't be afraid
to ping us back if don't hear anything from us.
