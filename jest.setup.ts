// Global database connection setup for tests
import { createTestDatabase } from './src/utils/database';

beforeAll(async () => {
  // Check if we have a valid database connection, if not create one
  let needsNewConnection = false;

  if (!globalThis.__DB__ || !globalThis.__TESTCONTAINER__) {
    needsNewConnection = true;
  } else {
    // Check if the connection is still valid
    try {
      await globalThis.__DB__`SELECT 1`;
    } catch {
      needsNewConnection = true;
    }
  }

  if (needsNewConnection) {
    const { container, db } = await createTestDatabase();
    globalThis.__TESTCONTAINER__ = container;
    globalThis.__DB__ = db;
  }

  // Make the global database connection available in tests
  global.db = globalThis.__DB__;
  global.container = globalThis.__TESTCONTAINER__;
});

afterAll(() => {
  // Clean up global references
  // @ts-expect-error delete
  global.db = undefined;
  // @ts-expect-error delete
  global.container = undefined;
});

afterEach(async () => {
  // Restore to empty snapshot after each test
  if (global.container) {
    await global.container.restoreSnapshot('empty');
  }
});
