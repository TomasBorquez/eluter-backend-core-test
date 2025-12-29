// Global database connection setup for tests

beforeAll(() => {
  // Make the global database connection available in tests
  global.db = globalThis.__DB__;
  global.container = globalThis.__TESTCONTAINER__;
});

afterEach(async () => {
  // Restore to empty snapshot after each test
  if (global.container) {
    await global.container.restoreSnapshot('empty');
  }
});
