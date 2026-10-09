/** @jest-environment node */
import { revalidatePath } from "next/cache";
import { makeCreateCategory, makeDeleteCategory, makeUpdateCategory } from "@/main";
import { createCategory, deleteCategory, updateCategory } from "./actions";

jest.mock("@/main", () => ({
  makeCreateCategory: jest.fn(),
  makeUpdateCategory: jest.fn(),
  makeDeleteCategory: jest.fn(),
}));
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

describe("updateCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("repassa o formulário e revalida a tela principal e a de categorias", async () => {
    const useCase = jest.fn().mockResolvedValue({ ok: true, value: undefined });
    jest.mocked(makeUpdateCategory).mockResolvedValue(useCase);
    const formData = new FormData();
    formData.set("id", "c-1");
    formData.set("name", "Diversão");

    expect(await updateCategory(null, formData)).toEqual({ ok: true, value: undefined });
    expect(useCase).toHaveBeenCalledWith({ id: "c-1", name: "Diversão" });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/categories");
  });
});

describe("deleteCategory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("remove pelo id e revalida a página de categorias", async () => {
    const useCase = jest.fn().mockResolvedValue({ ok: true, value: undefined });
    jest.mocked(makeDeleteCategory).mockResolvedValue(useCase);

    expect(await deleteCategory("c-1")).toEqual({ ok: true, value: undefined });
    expect(useCase).toHaveBeenCalledWith("c-1");
    expect(revalidatePath).toHaveBeenCalledWith("/categories");
  });

  it("devolve o bloqueio do caso de uso sem revalidar", async () => {
    const blocked = { ok: false, error: "Mantenha pelo menos uma categoria de receita." };
    jest.mocked(makeDeleteCategory).mockResolvedValue(jest.fn().mockResolvedValue(blocked));
    expect(await deleteCategory("c-1")).toEqual(blocked);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
