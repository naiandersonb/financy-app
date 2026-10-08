import { z } from "zod";
import { isValidCategory } from "@/domain";
import { isIsoCalendarDate } from "@/shared";
import { amountInCentsSchema } from "./amount-schema";

export const transactionInputSchema = z
  .object({
    kind: z.enum(["income", "expense"], "Escolha se é receita ou despesa."),
    description: z
      .string("Informe uma descrição com até 120 caracteres.")
      .trim()
      .min(1, "Informe uma descrição com até 120 caracteres.")
      .max(120, "Informe uma descrição com até 120 caracteres."),
    amount: amountInCentsSchema("Informe um valor maior que zero."),
    category: z.string("Escolha uma categoria válida."),
    occurredOn: z
      .string("Informe uma data válida.")
      .refine(isIsoCalendarDate, "Informe uma data válida."),
  })
  .refine((input) => isValidCategory(input.kind, input.category), {
    message: "Escolha uma categoria válida.",
    path: ["category"],
  })
  .transform(({ amount, ...rest }) => ({ ...rest, amountCents: amount }));
