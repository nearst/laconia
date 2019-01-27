const EventAdapter = require("./EventAdapter");

const createEventAdapter = inputConverter => ({
  functional = true
} = {}) => app => {
  const adapter = new EventAdapter(app, inputConverter);
  return functional ? adapter.toFunction() : adapter;
};

module.exports = createEventAdapter;
