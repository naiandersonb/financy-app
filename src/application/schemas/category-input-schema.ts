import { z } from "zod";
import { hasReadableContrast } from "@/domain";

const NAME_MESSAGE = "Informe um nome com até 30 caracteres.";
const LOW_CONTRAST = {
  message: "Pouco contraste: o nome pode ficar difícil de ler.",
  path: ["textColor"],
};

function colorSchema(message: string) {
  return z
    .string(message)
    .trim()
    .toLowerCase()
    .regex(/^#[0-9a-f]{6}$/, message);
}

/** Campos que podem ser escolhidos na criação e alterados na edição. */
const editableFields = {
  name: z.string(NAME_MESSAGE).trim().min(1, NAME_MESSAGE).max(30, NAME_MESSAGE),
  backgroundColor: colorSchema("Informe uma cor de fundo válida (ex.: #e5e7eb)."),
  textColor: colorSchema("Informe uma cor de texto válida (ex.: #1f2937)."),
};

function readable(input: { backgroundColor: string; textColor: string }): boolean {
  return hasReadableContrast(input.backgroundColor, input.textColor);
}

export const categoryInputSchema = z
  .object({
    kind: z.enum(["income", "expense"], "Escolha se é receita ou despesa."),
    ...editableFields,
  })
  .refine(readable, LOW_CONTRAST);

/** Edição: o tipo não faz parte do schema, então não pode ser trocado nem forçando a requisição. */
export const categoryUpdateSchema = z
  .object({ id: z.uuid("Categoria não encontrada."), ...editableFields })
  .refine(readable, LOW_CONTRAST);
