import { z } from "zod";

/** Valor vindo de <input type="number"> ("1234.5") convertido em centavos inteiros e positivos. */
export function amountInCentsSchema(message: string) {
  return z
    .string(message)
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, message)
    .transform((raw) => Math.round(Number(raw) * 100))
    .refine((cents) => cents > 0, message);
}
