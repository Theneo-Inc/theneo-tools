abstract class ResultImpl<T, E extends Error> {
  protected abstract _chain<X, U extends Error>(
    ok: (value: T) => Result<X, U>,
    err: (error: E) => Result<X, U>
  ): Result<X, U>;

  unwrap(): T;
  unwrap<U>(ok: (value: T) => U): U;
  unwrap<U, V>(ok: (value: T) => U, err: (error: E) => V): U | V;
  unwrap<U>(ok: (value: T) => U, err: (error: E) => U): U;
  unwrap(ok?: (value: T) => unknown, err?: (error: E) => unknown): unknown {
    const r = this._chain(
      value => Result.ok(ok ? ok(value) : value),
      error => (err ? Result.ok(err(error)) : Result.err(error))
    );
    if (r.err) {
      throw r.error;
    }
    return r.value;
  }

  map<U>(ok: (value: T) => U): Result<U, E>;
  map<U, F extends Error>(
    ok: (value: T) => U,
    err: (error: E) => F
  ): Result<U, F>;
  map(ok: (value: T) => unknown, err?: (error: E) => Error): Result<unknown> {
    return this._chain(
      value => Result.ok(ok(value)),
      error => Result.err(err ? err(error) : error)
    );
  }

  chain<X>(ok: (value: T) => Result<X, E>): Result<X, E>;
  chain<X>(
    ok: (value: T) => Result<X, E>,
    err: (error: E) => Result<X, E>
  ): Result<X, E>;
  chain<X, U extends Error>(
    ok: (value: T) => Result<X, U>,
    err: (error: E) => Result<X, U>
  ): Result<X, U>;
  chain(
    ok: (value: T) => Result<unknown>,
    err?: (error: E) => Result<unknown>
  ): Result<unknown> {
    return this._chain(ok, err ?? (error => Result.err(error)));
  }
}

class OkImpl<T, E extends Error> extends ResultImpl<T, E> {
  readonly ok = true;
  readonly err = false;
  constructor(readonly value: T) {
    super();
  }

  protected _chain<X, U extends Error>(
    ok: (value: T) => Result<X, U>,
    _err: (error: E) => Result<X, U>
  ): Result<X, U> {
    return ok(this.value);
  }
}

class ErrImpl<T, E extends Error> extends ResultImpl<T, E> {
  readonly ok = false;
  readonly err = true;
  constructor(readonly error: E) {
    super();
  }

  protected _chain<X, U extends Error>(
    _ok: (value: T) => Result<X, U>,
    err: (error: E) => Result<X, U>
  ): Result<X, U> {
    return err(this.error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {
  export interface Ok<T, E extends Error> extends OkImpl<T, E> {}

  export interface Err<T, E extends Error> extends ErrImpl<T, E> {}

  export function ok<T, E extends Error>(value: T): Result<T, E> {
    return new OkImpl(value);
  }

  export function err<E extends Error, T = never>(error?: E): Result<T, E>;
  export function err<E extends Error, T = never>(error: E): Result<T, E> {
    return new ErrImpl(error || new Error());
  }
}

export type Result<T, E extends Error = Error> =
  | Result.Ok<T, E>
  | Result.Err<T, E>;
