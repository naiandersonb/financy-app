/** @jest-environment node */
import { toDatabaseError } from "./database-error";

describe("toDatabaseError", () => {
  it("inclui contexto e código, e preserva só código e mensagem na causa", () => {
    const error = toDatabaseError("Falha ao criar lançamento", {
      code: "23502",
      message: "null value in column",
      details: "Failing row contains (..., 1500, ...)",
    } as { code: string; message: string });

    expect(error.message).toBe("Falha ao criar lançamento (código 23502)");
    expect(error.cause).toEqual({ code: "23502", message: "null value in column" });
    expect(JSON.stringify(error.cause)).not.toContain("Failing row");
  });

  it("indica código desconhecido quando o erro não tem código", () => {
    expect(toDatabaseError("Falha", { message: "x" }).message).toBe(
      "Falha (código desconhecido)",
    );
  });
});
