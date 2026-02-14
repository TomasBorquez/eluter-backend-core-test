import { createHooks } from 'src/utils/hooks';
import { effect, EffectOptions } from './client';
import { atomicDebit, getBalance } from './repository';

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

function effectsRan(effectOptions?: EffectOptions) {
  return effectOptions?.effectPerformed?.mock.calls.length
}

export async function yourImplementation({
  accountId,
  amount,
  hooks,
  effectOptions,
}: TransactionInterface) {
  const balance = await getBalance(accountId);
  if (parseFloat(amount) > parseFloat(balance.balance)) return false;

  // NOTE: transaction so if debit fails, we rollback
  const debitSuccess = await db.begin(async (tx) => {
    const debitResult = await atomicDebit(accountId, amount, hooks, tx);
    if (debitResult.count === 0) return false;
    return true;
  });

  if (!debitSuccess) return false;

  try {
    await effect({ hooks, ...effectOptions });
    return true;
  } catch (e) {
    if (!effectsRan(effectOptions)) {
      await db`
        UPDATE balances
        SET balance = balance + ${amount}
        WHERE id = ${accountId}`;
    }
    // NOTE: if effect DID run, the debit stays committed
    throw e;
  }
}
