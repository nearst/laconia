module.exports = {
  toContainBody(input, body) {
    expect(input).toEqual(expect.objectContaining({ body }));
    return { pass: true };
  },
  toHaveStatusCode(input, statusCode) {
    expect(input).toEqual(
      expect.objectContaining({
        statusCode
      })
    );
    return { pass: true };
  },
  toContainHeader(input, headerName, headerValue) {
    expect(input).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          [headerName]: headerValue
        })
      })
    );
    return { pass: true };
  },
  toBeBase64Encoded(input, value) {
    expect(input).toEqual(
      expect.objectContaining({
        isBase64Encoded: value
      })
    );
    return { pass: true };
  }
};
