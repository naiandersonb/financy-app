/** @jest-environment node */
import { contrastRatio, parseHexColor, relativeLuminance } from "./color-contrast";

describe("parseHexColor", () => {
  it("lê cores #rrggbb em minúsculas ou maiúsculas", () => {
    expect(parseHexColor("#1f2937")).toEqual({ r: 31, g: 41, b: 55 });
    expect(parseHexColor("#FDE68A")).toEqual({ r: 253, g: 230, b: 138 });
  });

  it.each(["#12345", "1f2937", "#1f29377", "azul", "#ggg000", ""])("rejeita %p", (value) => {
    expect(parseHexColor(value)).toBeNull();
  });
});

describe("relativeLuminance", () => {
  it("vai de 0 no preto a 1 no branco", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1);
  });
});

describe("contrastRatio", () => {
  it("é 21:1 entre preto e branco, em qualquer ordem", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21);
  });

  it("é 1:1 entre cores iguais", () => {
    expect(contrastRatio("#3730a3", "#3730a3")).toBeCloseTo(1);
  });

  it("calcula os casos da spec", () => {
    expect(contrastRatio("#fde68a", "#78350f")).toBeCloseTo(7.28, 2);
    expect(contrastRatio("#ffffff", "#eeeeee")).toBeCloseTo(1.16, 2);
  });

  it("devolve null quando alguma cor é inválida", () => {
    expect(contrastRatio("#ffffff", "azul")).toBeNull();
    expect(contrastRatio("#123", "#ffffff")).toBeNull();
  });
});
