type PostgrestLikeError = { code?: string; message: string };

/**
 * Erro do banco sem os `details` do Postgres, que podem conter a linha inteira
 * (valores financeiros) e não devem chegar aos logs.
 */
export function toDatabaseError(context: string, error: PostgrestLikeError): Error {
  return new Error(`${context} (código ${error.code ?? "desconhecido"})`, {
    cause: { code: error.code, message: error.message },
  });
}
