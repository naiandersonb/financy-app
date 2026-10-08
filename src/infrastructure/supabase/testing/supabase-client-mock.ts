import type { SupabaseClient } from "@supabase/supabase-js";

export type QueryResult = {
  data?: unknown;
  error: { code?: string; message: string; details?: string } | null;
};

export type RecordedCall = [method: string, args: unknown[]];

/**
 * Cliente Supabase falso para testar repositórios: grava a cadeia de chamadas do query builder
 * (`from`, `select`, `eq`…) e resolve com o resultado configurado quando aguardado.
 */
export function createSupabaseClientMock(result: QueryResult) {
  const calls: RecordedCall[] = [];
  const builder: object = new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "then") {
          return (resolve: (value: QueryResult) => unknown) => resolve(result);
        }
        return (...args: unknown[]) => {
          calls.push([String(property), args]);
          return builder;
        };
      },
    },
  );
  const client = {
    from: (...args: unknown[]) => {
      calls.push(["from", args]);
      return builder;
    },
  };
  return { client: client as unknown as SupabaseClient, calls };
}
