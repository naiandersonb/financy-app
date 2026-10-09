export type Rgb = { r: number; g: number; b: number };

const HEX_COLOR_PATTERN = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

/** "#1f2937" → { r: 31, g: 41, b: 55 }; `null` se não for uma cor `#rrggbb`. */
export function parseHexColor(hex: string): Rgb | null {
  const match = HEX_COLOR_PATTERN.exec(hex);
  if (!match) return null;
  const [r, g, b] = match.slice(1).map((channel) => parseInt(channel, 16));
  return { r, g, b };
}

/** Luminância relativa da WCAG 2.x, de 0 (preto) a 1 (branco). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Razão de contraste WCAG entre duas cores `#rrggbb` (de 1 a 21); `null` se alguma for inválida. */
export function contrastRatio(first: string, second: string): number | null {
  const a = parseHexColor(first);
  const b = parseHexColor(second);
  if (!a || !b) return null;
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}
