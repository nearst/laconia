module.exports = class ApiGatewayEventAdapter {
  constructor(
    app,
    inputConverter,
    outputConverter,
    errorConverter,
    includeInputHeaders
  ) {
    this.app = app;
    this.inputConverter = inputConverter;
    this.outputConverter = outputConverter;
    this.errorConverter = errorConverter;
    this.includeInputHeaders = includeInputHeaders;
  }

  async handle(event, laconiaContext) {
    const input = await this.inputConverter.convert(event);
    try {
      const output = this.includeInputHeaders
        ? await this.app(input.payload, input.headers, laconiaContext)
        : await this.app(input.payload, laconiaContext);
      return this.outputConverter.convert(output);
    } catch (error) {
      return this.errorConverter.convert(error);
    }
  }

  toFunction() {
    return this.handle.bind(this);
  }
};
