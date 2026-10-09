import { z } from "zod";

/**
 * Caminho interno para onde ir após o login. Qualquer valor que não seja um caminho relativo
 * do próprio app (ex.: `https://…`, `//site`, `/\site`) vira `/`, evitando open redirect.
 */
export const redirectPathSchema = z
  .string()
  .refine((path) => /^\/(?![/\\])/.test(path))
  .catch("/");
