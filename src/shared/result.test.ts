/** @jest-environment node */
import { fail, succeed } from "./result";

describe("Result", () => {
  it("succeed sem valor representa sucesso sem dado", () => {
    expect(succeed()).toEqual({ ok: true, value: undefined });
  });

  it("succeed carrega o valor", () => {
    expect(succeed(42)).toEqual({ ok: true, value: 42 });
  });

  it("fail carrega o erro", () => {
    expect(fail("inválido")).toEqual({ ok: false, error: "inválido" });
  });
});
