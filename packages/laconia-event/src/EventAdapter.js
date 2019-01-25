module.exports = class EventAdapter {
  constructor(app, inputConverter) {
    this.app = app;
    this.inputConverter = inputConverter;
  }

  async handle(event, laconiaContext) {
    const input = await this.inputConverter.convert(event);
    return this.app(input, laconiaContext);
  }

  toFunction() {
    return this.handle.bind(this);
  }
};
