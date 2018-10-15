# Development

## Getting Started

1.  Install nvm
2.  Run `nvm install 8.10` to install node 8
3.  Run `npm i`  
    This will also run `lerna bootstrap` for you.

## Acceptance Test

1.  Generate your AWS Access Key  
    You must have the permission required to provision the stack.
2.  Setup AWS credentials in `~/.aws/credentials`
3.  Run `npm run test:acceptance`  
    This command will deploy the acceptance stack via `serverless framework`, then run the acceptance test.

# Release

Ensure everything is running when they're clean first by running: `npm run clean && npm install && npm run test:all`.

Run `npx lerna publish`. This command will do everything for you:

1.  Version update to all packages' package.json
2.  Inter dependency update
3.  Git commit
4.  Git tag creation
5.  NPM package publish to npmjs
6.  Git tag push
