/** @jest-environment node */
import { revalidatePath } from "next/cache";
import {
  makeDeleteBudget,
  makeDeleteTransaction,
  makeSaveBudget,
  makeSaveTransaction,
} from "@/main";
import { deleteBudget, deleteTransaction, saveBudget, saveTransaction } from "./actions";

jest.mock("@/main", () => ({
  makeSaveTransaction: jest.fn(),
  makeDeleteTransaction: jest.fn(),
  makeSaveBudget: jest.fn(),
  makeDeleteBudget: jest.fn(),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const success = { ok: true, value: undefined };

function formWith(fields: Record<string, string>) {
  const formData = new FormData();
  Object.entries(fields).forEach(([name, value]) => formData.set(name, value));
  return formData;
}

let consoleError: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => consoleError.mockRestore());

describe("saveTransaction", () => {
  it("repassa o formulário ao caso de uso e revalida a tela", async () => {
    const useCase = jest.fn().mockResolvedValue(success);
    jest.mocked(makeSaveTransaction).mockResolvedValue(useCase);

    const result = await saveTransaction(null, formWith({ description: "Mercado", amount: "10" }));

    expect(result).toEqual(success);
    expect(useCase).toHaveBeenCalledWith({ description: "Mercado", amount: "10" });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("devolve erro de validação sem revalidar", async () => {
    jest.mocked(makeSaveTransaction).mockResolvedValue(
      jest.fn().mockResolvedValue({ ok: false, error: "Informe um valor maior que zero." }),
    );
    const result = await saveTransaction(null, formWith({}));
    expect(result).toEqual({ ok: false, error: "Informe um valor maior que zero." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("troca falha de infraestrutura por mensagem amigável e registra o erro", async () => {
    const failure = new Error("Falha ao criar lançamento (código 42501)");
    jest.mocked(makeSaveTransaction).mockResolvedValue(jest.fn().mockRejectedValue(failure));

    const result = await saveTransaction(null, formWith({}));

    expect(result).toEqual({ ok: false, error: "Não foi possível salvar o lançamento." });
    expect(consoleError).toHaveBeenCalledWith("Não foi possível salvar o lançamento.", failure);
  });
});

describe("deleteTransaction", () => {
  it("exclui pelo id e revalida", async () => {
    const useCase = jest.fn().mockResolvedValue(undefined);
    jest.mocked(makeDeleteTransaction).mockResolvedValue(useCase);
    expect(await deleteTransaction("abc")).toEqual(success);
    expect(useCase).toHaveBeenCalledWith("abc");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("devolve mensagem amigável em caso de falha", async () => {
    jest.mocked(makeDeleteTransaction).mockResolvedValue(jest.fn().mockRejectedValue(new Error("x")));
    expect(await deleteTransaction("abc")).toEqual({
      ok: false,
      error: "Não foi possível excluir o lançamento.",
    });
  });
});

describe("saveBudget", () => {
  it("repassa o formulário ao caso de uso", async () => {
    const useCase = jest.fn().mockResolvedValue(success);
    jest.mocked(makeSaveBudget).mockResolvedValue(useCase);
    expect(await saveBudget(null, formWith({ categoryId: "cat-lazer", limit: "400" }))).toEqual(success);
    expect(useCase).toHaveBeenCalledWith({ categoryId: "cat-lazer", limit: "400" });
  });

  it("devolve mensagem amigável em caso de falha", async () => {
    jest.mocked(makeSaveBudget).mockResolvedValue(jest.fn().mockRejectedValue(new Error("x")));
    expect(await saveBudget(null, formWith({}))).toEqual({
      ok: false,
      error: "Não foi possível salvar o orçamento.",
    });
  });
});

describe("deleteBudget", () => {
  it("exclui pela categoria", async () => {
    const useCase = jest.fn().mockResolvedValue(undefined);
    jest.mocked(makeDeleteBudget).mockResolvedValue(useCase);
    expect(await deleteBudget("cat-lazer")).toEqual(success);
    expect(useCase).toHaveBeenCalledWith("cat-lazer");
  });

  it("devolve mensagem amigável em caso de falha", async () => {
    jest.mocked(makeDeleteBudget).mockResolvedValue(jest.fn().mockRejectedValue(new Error("x")));
    expect(await deleteBudget("cat-lazer")).toEqual({
      ok: false,
      error: "Não foi possível excluir o orçamento.",
    });
  });
});
