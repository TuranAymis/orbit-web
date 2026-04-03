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
