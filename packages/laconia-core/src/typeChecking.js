const checkFunction = (functionName, argument) => {
  if (typeof argument !== "function")
    throw new TypeError(
      `${functionName}() expects to be passed a function, you passed: ${JSON.stringify(
        argument
      )}`
    );
};
const checkFunctionOrObject = (functionName, argument) => {
  if (typeof argument !== "function" && typeof argument !== "object")
    throw new TypeError(
      `${functionName}() expects to be passed a function or object, you passed: ${JSON.stringify(
        argument
      )}`
    );
};

module.exports = {
  checkFunction,
  checkFunctionOrObject
};
