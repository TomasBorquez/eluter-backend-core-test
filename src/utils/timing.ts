export async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

export async function delay<T>(promise: Promise<T>, ms: number) {
  await wait(ms);
  return promise;
}

export function measureTime<R>(fn: () => R) {
  const start = process.hrtime.bigint();
  const res = fn();
  const end = process.hrtime.bigint();
  const delta = end - start;
  return { res, delta };
}
