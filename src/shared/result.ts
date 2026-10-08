export type Success<T> = { ok: true; value: T };
export type Failure<E> = { ok: false; error: E };

/** Resultado de uma operação com falha prevista (validação, regra de negócio). */
export type Result<T = void, E = string> = Success<T> | Failure<E>;

export function succeed(): Success<void>;
export function succeed<T>(value: T): Success<T>;
export function succeed<T>(value?: T): Success<T | undefined> {
  return { ok: true, value };
}

export function fail<E>(error: E): Failure<E> {
  return { ok: false, error };
}
