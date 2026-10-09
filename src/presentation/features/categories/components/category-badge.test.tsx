import { render, screen } from "@testing-library/react";
import { CategoryBadge } from "./category-badge";

describe("CategoryBadge", () => {
  it("mostra o nome com as cores da categoria", () => {
    render(
      <CategoryBadge category={{ name: "Lazer", backgroundColor: "#dcfce7", textColor: "#166534" }} />,
    );
    const badge = screen.getByText("Lazer");
    expect(badge).toHaveStyle({ backgroundColor: "#dcfce7", color: "#166534" });
  });
});
