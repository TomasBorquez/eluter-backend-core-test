import { TransactionArguments } from './implementations';

export type Balance = {
  id: string;
  balance: string;
};

export async function createAccount(_db = db) {
	const [result] = await _db<Pick<Balance, "id">[]>`INSERT INTO balances (balance) VALUES (0) RETURNING id`;
	return result.id;
}

export async function getBalance(accountId: string, _db = db) {
  const [result] = await _db<Balance[]>`SELECT balance FROM balances WHERE id = ${accountId}`;
  return result;
}

export async function credit(accountId: string, amount: string, _db = db) {
  return _db`UPDATE balances SET balance = balance + ${amount} WHERE id = ${accountId}`;
}

export async function atomicDebit(
  accountId: string,
  amount: string,
  hooks?: TransactionArguments,
  _db = db,
) {
  await hooks?.preDebit?.waitFor();

  const res = await _db`
    UPDATE balances
    SET balance = balance - ${amount}
    WHERE id = ${accountId}
      AND balance >= ${amount}
  `;

  await hooks?.postDebit?.waitFor();
  return res;
}
