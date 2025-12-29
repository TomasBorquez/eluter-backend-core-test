import { createTestDatabase } from './src/utils/database';

export default async (): Promise<void> => {
  // Only create if not already exists (for initial setup)
  if (!globalThis.__TESTCONTAINER__ && !globalThis.__DB__) {
    const { container, db } = await createTestDatabase();
    // Store globally for access in tests and teardown
    globalThis.__TESTCONTAINER__ = container;
    globalThis.__DB__ = db;
  }
};
