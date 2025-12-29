export default async (): Promise<void> => {
  if (globalThis.__DB__) {
    await globalThis.__DB__.end();
    // @ts-expect-error delete
    delete globalThis.__DB__;
  }

  if (globalThis.__TESTCONTAINER__) {
    await globalThis.__TESTCONTAINER__.stop();
    // @ts-expect-error delete
    delete globalThis.__TESTCONTAINER__;
  }
};
