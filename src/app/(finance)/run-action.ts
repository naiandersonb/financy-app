import { revalidatePath } from "next/cache";
import { fail, type Result } from "@/shared";

/**
 * Executa o caso de uso, revalida a tela quando dá certo e troca falhas de infraestrutura
 * por uma mensagem para o usuário. O erro original vai para o log (já sem dados financeiros).
 */
export async function runAndRevalidate(
  failureMessage: string,
  revalidate: string | string[],
  run: () => Promise<Result>,
): Promise<Result> {
  try {
    const result = await run();
    if (result.ok) [revalidate].flat().forEach((path) => revalidatePath(path));
    return result;
  } catch (error) {
    console.error(failureMessage, error);
    return fail(failureMessage);
  }
}
