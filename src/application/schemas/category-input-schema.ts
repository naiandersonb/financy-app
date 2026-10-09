import { z } from "zod";
import { hasReadableContrast } from "@/domain";

const NAME_MESSAGE = "Informe um nome com até 30 caracteres.";

function colorSchema(message: string) {
  return z
    .string(message)
    .trim()
    .toLowerCase()
    .regex(/^#[0-9a-f]{6}$/, message);
}

export const categoryInputSchema = z
  .object({
    kind: z.enum(["income", "expense"], "Escolha se é receita ou despesa."),
    name: z.string(NAME_MESSAGE).trim().min(1, NAME_MESSAGE).max(30, NAME_MESSAGE),
    backgroundColor: colorSchema("Informe uma cor de fundo válida (ex.: #e5e7eb)."),
    textColor: colorSchema("Informe uma cor de texto válida (ex.: #1f2937)."),
  })
  .refine((input) => hasReadableContrast(input.backgroundColor, input.textColor), {
    message: "Pouco contraste: o nome pode ficar difícil de ler.",
    path: ["textColor"],
  });
