import { getBalance } from './repository';
import { seedTransaction } from './seed';
import {
  initTransactionHooks,
  naiveTransaction,
yourImplementation
} from './implementations';

const implementations = [
  naiveTransaction,
  yourImplementation
];
// const implementations = [naiveTransaction];
// const implementations = [naiveWithDBTransaction];
// const implementations = [reOrdered];

describe.each(implementations)('Transaction', (implementation) => {
  describe(`Implementation: ${implementation.name}`, () => {
    describe('Basic spec', () => {
      it('Processes a single transaction', async () => {
        const { accountId } = await seedTransaction();
        const result = await implementation({
          accountId,
          amount: '100',
        });
        const balance = parseFloat((await getBalance(accountId)).balance);
        expect(result).toBeTruthy();
        expect(balance).toBeCloseTo(0);
      });

      it('Rejects overdraft', async () => {
        const { accountId } = await seedTransaction();
        const result = await implementation({
          accountId,
          amount: '101',
        });
        expect(result).toBeFalsy();
        expect(parseFloat((await getBalance(accountId)).balance)).toBeCloseTo(
          100,
        );
      });

      it('Processes secuential transactions', async () => {
        const { accountId } = await seedTransaction();
        const first = await implementation({
          accountId,
          amount: '100',
        });
        const second = await implementation({
          accountId,
          amount: '100',
        });
        expect(first).toBeTruthy();
        expect(second).toBeFalsy();
        expect(parseFloat((await getBalance(accountId)).balance)).toBeCloseTo(
          0,
        );
      });

      it('Rollbacks on failure', async () => {
        const { accountId } = await seedTransaction();
        const promise = implementation({
          accountId,
          amount: '100',
          effectOptions: { fail: true },
        });
        await expect(promise).rejects.toThrow();
        const balance = (await getBalance(accountId)).balance;

        expect(parseFloat(balance)).toBeCloseTo(100);
      });
    });

    describe('Vulnerabilities', () => {
      it('Double Spend in parallel', async () => {
        const { accountId } = await seedTransaction();
        const [first, second] = await Promise.all([
          implementation({
            accountId,
            amount: '100',
          }),
          implementation({
            accountId,
            amount: '100',
          }),
        ]);

        const balance = parseFloat((await getBalance(accountId)).balance);

        expect(balance).toBeCloseTo(0);

        // Only one should pass
        expect(first).not.toEqual(second);
      });

      it('Stale updates under heavy paralellism', async () => {
        const { accountId } = await seedTransaction();
        const n = 100;
        const amount = (100 / n).toString();
        const promises = await Promise.all(
          Array(n)
            .fill(0)
            .map(() =>
              implementation({
                accountId,
                amount: amount,
              }),
            ),
        );
        const balance = parseFloat((await getBalance(accountId)).balance);

        const passes = promises.reduce((p, c) => p + (c ? 1 : 0), 0);

        expect(balance).toBeCloseTo(100 - passes * parseFloat(amount));
      });

      it('Phantom Effect 1', async () => {
        const { accountId } = await seedTransaction();
        const hooks = initTransactionHooks(['preDebit']);
        const effectMock = jest.fn();
        const promise = implementation({
          accountId,
          amount: '100',
          hooks,
          effectOptions: {
            effectPerformed: effectMock,
          },
        });
        hooks.preDebit.trigger({ fail: true });

        await expect(promise).rejects.toThrow();
        const balance = parseFloat((await getBalance(accountId)).balance);

        if (effectMock.mock.calls.length) {
          expect(balance).toBeCloseTo(0);
        } else {
          expect(balance).toBeCloseTo(100);
        }
      });

      it('Phantom Effect 2', async () => {
        const { accountId } = await seedTransaction();
        const hooks = initTransactionHooks(['postEffect']);
        const effectMock = jest.fn();
        const promise = implementation({
          accountId,
          amount: '100',
          hooks,
          effectOptions: {
            effectPerformed: effectMock,
          },
        });
        hooks.postEffect.trigger({ fail: true });

        await expect(promise).rejects.toThrow();
        const balance = parseFloat((await getBalance(accountId)).balance);

        if (effectMock.mock.calls.length) {
          expect(balance).toBeCloseTo(0);
        } else {
          expect(balance).toBeCloseTo(100);
        }
      });
    });
  });
});
