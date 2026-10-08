import type { z } from "zod";

/** Mensagem do primeiro problema encontrado, já escrita para o usuário no próprio schema. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0].message;
}
