module.exports = class SingleCache {
  constructor(maxAge) {
    this.maxAge = maxAge;
  }

  hasExpired() {
    return Date.now() - this.lastModified > this.maxAge;
  }

  set(value) {
    this.lastModified = Date.now();
    this.value = value;
  }

  get() {
    return this.value;
  }

  isEmpty() {
    return this.value === undefined;
  }
};
