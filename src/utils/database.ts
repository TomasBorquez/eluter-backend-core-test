import { PostgreSqlContainer } from '@testcontainers/postgresql';
import postgres from 'postgres';
import fs from 'fs/promises';

export async function createTestDatabase() {
  const container = await new PostgreSqlContainer('postgres:16-alpine').start();
  await container.snapshot('empty');

  const db = postgres(container.getConnectionUri());

  return { container, db };
}

export async function executeSqlFile(filePath: string, _db: postgres.Sql = db) {
  const sql = await fs.readFile(filePath, 'utf8');
  return await _db.unsafe(sql);
}
