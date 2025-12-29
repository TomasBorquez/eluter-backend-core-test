export class HookRejection extends Error {}
export class HookAlreadyTriggered extends Error {}
export class Hook {
  private resolve: () => any;
  private reject: () => any;
  private promise: Promise<any>;
  public pending = true;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = () => resolve(null);
      this.reject = () => reject(new HookRejection());
    });
  }

  public trigger(options: { fail?: boolean } = {}) {
    if (!this.pending) throw new HookAlreadyTriggered();
    if (options.fail) {
      this.reject();
    } else {
      this.resolve();
    }
  }
  public waitFor() {
    if (!this.pending) throw new HookAlreadyTriggered();
    return this.promise;
  }
}

export function createHooks<H extends string>(names: H[]) {
  return Object.fromEntries(names.map((n) => [n, new Hook()])) as Record<
    H,
    Hook
  >;
}

export function triggerAll(hooks: Record<string, Hook>) {
  for (const hook of Object.values(hooks)) {
    if (hook.pending) hook.trigger();
  }
}
