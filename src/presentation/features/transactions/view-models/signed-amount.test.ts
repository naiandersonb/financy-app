/** @jest-environment node */
import { signedAmount } from "./signed-amount";

const NBSP = " ";

describe("signedAmount", () => {
  it("mostra receita com sinal de mais", () => {
    expect(signedAmount({ kind: "income", amountCents: 500_000 })).toEqual({
      text: `+ R$${NBSP}5.000,00`,
      tone: "income",
    });
  });

  it("mostra despesa com o sinal de menos tipográfico", () => {
    expect(signedAmount({ kind: "expense", amountCents: 123_456 })).toEqual({
      text: `− R$${NBSP}1.234,56`,
      tone: "expense",
    });
  });
});
