import { z } from "zod";
import { amountInCentsSchema } from "./amount-schema";

export const budgetInputSchema = z
  .object({
    categoryId: z.uuid("Escolha uma categoria de despesa."),
    limit: amountInCentsSchema("Informe um limite maior que zero."),
  })
  .transform(({ categoryId, limit }) => ({ categoryId, limitCents: limit }));
