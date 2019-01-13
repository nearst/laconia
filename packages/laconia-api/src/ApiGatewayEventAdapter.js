module.exports = class ApiGatewayEventAdapter {
  constructor(app, inputConverter, outputConverter, includeInputHeaders) {
    this.app = app;
    this.inputConverter = inputConverter;
    this.outputConverter = outputConverter;
    this.includeInputHeaders = includeInputHeaders;
  }

  async handle(event, laconiaContext) {
    const input = await this.inputConverter.convert(event);
    const output = this.includeInputHeaders
      ? await this.app(input.payload, input.headers, laconiaContext)
      : await this.app(input.payload, laconiaContext);

    return this.outputConverter.convert(output);
  }

  toFunction() {
    return this.handle.bind(this);
  }
};
