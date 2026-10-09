/** @jest-environment node */
import { revalidatePath } from "next/cache";
import { runAndRevalidate } from "./run-action";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

describe("runAndRevalidate", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => consoleError.mockRestore());

  it("devolve o sucesso e revalida o caminho informado", async () => {
    const result = await runAndRevalidate("Falhou.", "/categories", async () => ({
      ok: true,
      value: undefined,
    }));
    expect(result).toEqual({ ok: true, value: undefined });
    expect(revalidatePath).toHaveBeenCalledWith("/categories");
  });

  it("revalida cada caminho de uma lista", async () => {
    await runAndRevalidate("Falhou.", ["/", "/categories"], async () => ({
      ok: true,
      value: undefined,
    }));
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/categories");
  });

  it("devolve a falha prevista sem revalidar", async () => {
    const result = await runAndRevalidate("Falhou.", "/", async () => ({
      ok: false,
      error: "Nome inválido.",
    }));
    expect(result).toEqual({ ok: false, error: "Nome inválido." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("troca exceção por mensagem amigável e registra o erro", async () => {
    const failure = new Error("banco fora do ar");
    const result = await runAndRevalidate("Falhou.", "/", async () => {
      throw failure;
    });
    expect(result).toEqual({ ok: false, error: "Falhou." });
    expect(consoleError).toHaveBeenCalledWith("Falhou.", failure);
  });
});
