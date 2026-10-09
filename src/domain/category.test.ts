/** @jest-environment node */
import { hasReadableContrast } from "./category";

describe("hasReadableContrast", () => {
  it("aceita contraste de pelo menos 4,5:1", () => {
    expect(hasReadableContrast("#fde68a", "#78350f")).toBe(true);
    // #767676 sobre branco fica logo acima de 4,5:1; #777777 fica logo abaixo.
    expect(hasReadableContrast("#ffffff", "#767676")).toBe(true);
  });

  it("recusa contraste abaixo de 4,5:1", () => {
    expect(hasReadableContrast("#ffffff", "#777777")).toBe(false);
    expect(hasReadableContrast("#ffffff", "#eeeeee")).toBe(false);
  });

  it("recusa cores inválidas", () => {
    expect(hasReadableContrast("#ffffff", "preto")).toBe(false);
  });
});
