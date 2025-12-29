import path from 'node:path';
import { executeSqlFile } from 'src/utils/database';
import { createAccount, credit } from './repository';

export async function seedTransaction() {
  await executeSqlFile(path.join(__dirname, 'schema.sql'));
  const accountId = await createAccount();
  await credit(accountId, '100');
  return { accountId };
}
