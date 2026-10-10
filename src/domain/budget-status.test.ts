/** @jest-environment node */
import { budgetStatuses } from "./budget-status";
import { makeTransaction } from "./testing/make-transaction";

function statusFor(limitCents: number, spentCents: number) {
  const transactions = spentCents
    ? [makeTransaction({ categoryId: "cat-lazer", amountCents: spentCents })]
    : [];
  return budgetStatuses([{ categoryId: "cat-lazer", limitCents }], transactions)[0];
}

describe("budgetStatuses", () => {
  it("calcula gasto, restante e uso dentro do limite", () => {
    expect(statusFor(40_000, 10_000)).toEqual({
      categoryId: "cat-lazer",
      limitCents: 40_000,
      spentCents: 10_000,
      remainingCents: 30_000,
      usage: 0.25,
      state: "ok",
    });
  });

  it.each([
    [0, "ok"],
    [799, "ok"],
    [800, "warning"],
    [1_000, "warning"],
    [1_001, "over"],
  ])("com limite R$ 10,00 e gasto de %i centavos, o estado é %s", (spent, state) => {
    expect(statusFor(1_000, spent).state).toBe(state);
  });

  it("dá restante negativo quando estoura", () => {
    expect(statusFor(40_000, 45_000)).toMatchObject({ remainingCents: -5_000, usage: 1.125 });
  });

  it("ignora receitas da mesma categoria", () => {
    const [status] = budgetStatuses(
      [{ categoryId: "cat-outros", limitCents: 1_000 }],
      [makeTransaction({ kind: "income", categoryId: "cat-outros", amountCents: 5_000 })],
    );
    expect(status.spentCents).toBe(0);
  });

  it("ordena estourados primeiro e depois do maior para o menor uso", () => {
    const statuses = budgetStatuses(
      [
        { categoryId: "cat-baixo", limitCents: 1_000 },
        { categoryId: "cat-estourado-pouco", limitCents: 1_000 },
        { categoryId: "cat-atencao", limitCents: 1_000 },
        { categoryId: "cat-estourado-muito", limitCents: 1_000 },
      ],
      [
        makeTransaction({ categoryId: "cat-baixo", amountCents: 100 }),
        makeTransaction({ categoryId: "cat-estourado-pouco", amountCents: 1_100 }),
        makeTransaction({ categoryId: "cat-atencao", amountCents: 900 }),
        makeTransaction({ categoryId: "cat-estourado-muito", amountCents: 3_000 }),
      ],
    );
    expect(statuses.map((status) => status.categoryId)).toEqual([
      "cat-estourado-muito",
      "cat-estourado-pouco",
      "cat-atencao",
      "cat-baixo",
    ]);
  });
});
