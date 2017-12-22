module.exports = class LambdaInvoker {
  constructor (lambda, functionName) {
    this.lambda = lambda
    this.functionName = functionName
  }

  fireAndForget () {
    return this.lambda.invoke({FunctionName: this.functionName}).promise().then(data => {
      if (data.FunctionError) {
        throw new Error(`${data.FunctionError} error returned by ${this.functionName}: ${data.Payload}`)
      } else {
        return data
      }
    })
  }
}
