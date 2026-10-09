/** @jest-environment node */
import { revalidatePath } from "next/cache";
import { makeCreateCategory } from "@/main";
import { createCategory } from "./actions";

jest.mock("@/main", () => ({ makeCreateCategory: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

describe("createCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("repassa o formulário ao caso de uso e revalida a página de categorias", async () => {
    const useCase = jest.fn().mockResolvedValue({ ok: true, value: undefined });
    jest.mocked(makeCreateCategory).mockResolvedValue(useCase);
    const formData = new FormData();
    formData.set("name", "Pets");
    formData.set("kind", "expense");

    expect(await createCategory(null, formData)).toEqual({ ok: true, value: undefined });
    expect(useCase).toHaveBeenCalledWith({ name: "Pets", kind: "expense" });
    expect(revalidatePath).toHaveBeenCalledWith("/categories");
  });

  it("devolve mensagem amigável quando a infraestrutura falha", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.mocked(makeCreateCategory).mockResolvedValue(jest.fn().mockRejectedValue(new Error("x")));

    expect(await createCategory(null, new FormData())).toEqual({
      ok: false,
      error: "Não foi possível criar a categoria.",
    });
    consoleError.mockRestore();
  });
});
