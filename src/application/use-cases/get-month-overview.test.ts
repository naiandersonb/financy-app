/** @jest-environment node */
import { makeTransaction } from "@/domain/testing/make-transaction";
import { InMemoryTransactionRepository } from "../testing/in-memory-transaction-repository";
import { getMonthOverview } from "./get-month-overview";

describe("getMonthOverview", () => {
  it("devolve os lançamentos do mês e os totais só deles", async () => {
    const repository = new InMemoryTransactionRepository();
    repository.items.push(
      makeTransaction({ id: "set-30", kind: "income", amountCents: 999_999, occurredOn: "2026-09-30" }),
      makeTransaction({ id: "salario", kind: "income", amountCents: 500_000, occurredOn: "2026-10-05" }),
      makeTransaction({ id: "aluguel", kind: "expense", amountCents: 300_000, occurredOn: "2026-10-01" }),
      makeTransaction({ id: "mercado", kind: "expense", amountCents: 20_050, occurredOn: "2026-10-31" }),
      makeTransaction({ id: "nov-01", kind: "expense", amountCents: 999_999, occurredOn: "2026-11-01" }),
    );

    const overview = await getMonthOverview(repository, "2026-10");

    expect(overview.transactions.map((item) => item.id)).toEqual(["salario", "aluguel", "mercado"]);
    expect(overview.summary).toEqual({
      incomeCents: 500_000,
      expenseCents: 320_050,
      balanceCents: 179_950,
    });
  });

  it("devolve totais zerados num mês sem lançamentos", async () => {
    const overview = await getMonthOverview(new InMemoryTransactionRepository(), "2026-10");
    expect(overview).toEqual({
      transactions: [],
      summary: { incomeCents: 0, expenseCents: 0, balanceCents: 0 },
    });
  });
});
