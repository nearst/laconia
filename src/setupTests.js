require("jest-extended");

/**
 * Meanwhile waiting for this PR to be published:
 * https://github.com/jest-community/jest-extended/pull/132
 */
const overrideMatcher = () => {
  const jestExpect = global.expect;

  const matchers = {
    toHaveBeenCalledBefore(mock1, mock2) {
      mock1.mock.invocationCallOrder.forEach(i => {
        mock2.mock.invocationCallOrder.forEach(j => {
          jestExpect(i).toBeLessThan(j);
        });
      });
      return { pass: true };
    }
  };

  jestExpect.extend(matchers);
};

overrideMatcher();
