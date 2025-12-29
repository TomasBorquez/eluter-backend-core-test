import { wait } from 'src/utils/timing';
import { TransactionArguments } from './implementations';

export class EffectFailed extends Error {}

export type EffectOptions = {
  fail?: boolean;
  effectPerformed?: jest.Mock;
  delay?: number;
};

export async function effect(
  options?: {
    hooks?: TransactionArguments;
  } & EffectOptions,
) {
  await options?.hooks?.preEffect?.waitFor();

  await wait(options?.delay ?? 100);
  if (options?.fail) {
    throw new EffectFailed();
  }
  options?.effectPerformed?.();

  await options?.hooks?.postEffect?.waitFor();
}
