import { z } from "zod";
import { isValidCategory } from "@/domain";
import { amountInCentsSchema } from "./amount-schema";

export const budgetInputSchema = z
  .object({
    category: z
      .string("Escolha uma categoria de despesa.")
      .refine((category) => isValidCategory("expense", category), "Escolha uma categoria de despesa."),
    limit: amountInCentsSchema("Informe um limite maior que zero."),
  })
  .transform(({ category, limit }) => ({ category, limitCents: limit }));
