// Increase default timeout for browser tests
jest.setTimeout(30000);

// Add custom matchers if needed
expect.extend({
  toBeVisibleInViewport: async (received) => {
    const pass = await received.isIntersectingViewport();
    return {
      pass,
      message: () => pass
        ? `expected element not to be visible in viewport`
        : `expected element to be visible in viewport`
    };
  }
});