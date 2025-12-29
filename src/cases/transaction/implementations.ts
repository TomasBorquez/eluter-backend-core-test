import { createHooks } from 'src/utils/hooks';
import { effect, EffectFailed, EffectOptions } from './client';
import { credit, debit, getBalance } from './repository';
import { PostgresError } from 'postgres';

const transactionHooks = [
  'preEffect',
  'postEffect',
  'preDebit',
  'postDebit',
] as const;
type TransactionHook = (typeof transactionHooks)[number];

export function initTransactionHooks<H extends TransactionHook>(hooks?: H[]) {
  // @ts-expect-error readonly
  return createHooks(hooks ?? transactionHooks);
}

export type TransactionArguments = Partial<
  ReturnType<typeof initTransactionHooks>
>;

export type TransactionInterface = {
  accountId: string;
  amount: string;
  hooks?: TransactionArguments;
  effectOptions?: EffectOptions;
};

export async function naiveTransaction({
  accountId,
  amount,
  hooks,
  effectOptions,
}: TransactionInterface) {
  const balance = await getBalance(accountId);
  if (parseFloat(amount) > parseFloat(balance.balance)) return false;

  await effect({ hooks, ...effectOptions });

  await debit(accountId, amount, hooks);

  return true;
}


export async function yourImplementation({
  accountId,
  amount,
  hooks,
  effectOptions,
}: TransactionInterface) {
  const balance = await getBalance(accountId);
  if (parseFloat(amount) > parseFloat(balance.balance)) return false;

  await effect({ hooks, ...effectOptions });

  await debit(accountId, amount, hooks);

  return true;
}
