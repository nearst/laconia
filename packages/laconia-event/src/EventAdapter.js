module.exports = class EventAdapter {
  constructor(app, inputConverterFactory) {
    this.app = app;
    this.inputConverterFactory = inputConverterFactory;
  }

  async handle(event, laconiaContext) {
    const input = await this.inputConverterFactory(laconiaContext).convert(
      event
    );
    return this.app(input, laconiaContext);
  }

  toFunction() {
    return this.handle.bind(this);
  }
};
