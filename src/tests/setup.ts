import "@testing-library/jest-dom/vitest";

const originalWarn = console.warn;

console.warn = (...args: unknown[]) => {
  const [firstArg] = args;

  if (
    typeof firstArg === "string" &&
    firstArg.includes("React Router Future Flag Warning")
  ) {
    return;
  }

  originalWarn(...args);
};

// Unit tests must never reach a real backend that happens to run on this machine (a 401 from it
// clears the mocked session). Tests that need fetch install their own mock over this default.
beforeEach(() => {
  globalThis.fetch = (() =>
    Promise.reject(new TypeError("Network access is disabled in unit tests"))) as typeof fetch;
});
