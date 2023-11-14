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
      value => Ok(ok ? ok(value) : value),
      error => (err ? Ok(err(error)) : Err(error))
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
      value => Ok(ok(value)),
      error => Err(err ? err(error) : error)
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
    return this._chain(ok, err ?? (error => Err(error)));
  }
}

class OkResult<T, E extends Error> extends ResultImpl<T, E> {
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

class ErrResult<T, E extends Error> extends ResultImpl<T, E> {
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

export function Ok<T, E extends Error>(value: T): Result<T, E> {
  return new OkResult(value);
}

export function Err<E extends Error, T = never>(error?: E): Result<T, E>;
export function Err<E extends Error, T = never>(error?: string): Result<T, E>;
export function Err<E extends Error, T = never>(
  error: E | string
): Result<T, E> {
  if (typeof error === 'string') {
    error = new Error(error) as E;
  }
  return new ErrResult(error || new Error());
}

export type Result<T, E extends Error = Error> =
  | OkResult<T, E>
  | ErrResult<T, E>;
