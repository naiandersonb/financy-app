import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 6;

const email = z.string().trim().pipe(z.email("Informe um e-mail válido."));

export const signInCredentialsSchema = z.object({
  email,
  password: z.string().min(1, "Informe a senha."),
});

export const signUpCredentialsSchema = z.object({
  email,
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    ),
});
