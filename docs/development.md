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
