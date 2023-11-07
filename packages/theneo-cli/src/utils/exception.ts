type TryCatchCommandFunctions<T> = (arg: T) => void | Promise<void>;

export function tryCatch<T>(
  fn: TryCatchCommandFunctions<T>
): TryCatchCommandFunctions<T> {
  return async (arg: T): Promise<void> => {
    try {
      const res = fn(arg);
      if (res instanceof Promise) {
        await res;
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error('unknown error:', e);
      }
      process.exit(1);
    }
  };
}
