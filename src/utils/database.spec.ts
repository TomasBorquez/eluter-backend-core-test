describe('database', () => {
  it('Should create table', async () => {
    await db`CREATE TABLE test (
        id SERIAL PRIMARY KEY
      );`;
    const tables = await db`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE';
      `;
    // Assert that 'transactions' table is included
    const tableNames = tables.map((t: any) => t.table_name);
    expect(tableNames).toContain('test');
    expect(true);
  });

  it('Should not find data after wipe', async () => {
    await db`CREATE TABLE test (
        id SERIAL PRIMARY KEY
      );`;
    await container.restoreSnapshot('empty');
    const tables = await db`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE';
      `;
    expect(tables.length).toBe(0);
  });
});
