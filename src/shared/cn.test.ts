/** @jest-environment node */
import { cn } from "./cn";

describe("cn", () => {
  it("junta classes e ignora valores falsos", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});
