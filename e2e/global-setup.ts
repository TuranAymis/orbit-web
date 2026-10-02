export default async function globalSetup(): Promise<void> {
  try {
    const response = await fetch("http://127.0.0.1:8000/health", {
      signal: AbortSignal.timeout(5000),
    });
    if (response.ok) return;
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    throw new Error(
      "Orbit backend is unavailable at http://127.0.0.1:8000/health. Start the E2E database and uvicorn as documented in e2e/README.md before running Playwright.",
      { cause: error },
    );
  }
}
