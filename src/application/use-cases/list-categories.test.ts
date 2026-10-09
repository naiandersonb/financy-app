/** @jest-environment node */
import { InMemoryCategoryRepository } from "../testing/in-memory-category-repository";
import { listCategories } from "./list-categories";

describe("listCategories", () => {
  it("devolve as categorias do usuário", async () => {
    const repository = new InMemoryCategoryRepository();
    const lazer = {
      id: "c-1",
      kind: "expense" as const,
      name: "Lazer",
      backgroundColor: "#dcfce7",
      textColor: "#166534",
    };
    repository.items.push(lazer);
    expect(await listCategories(repository)).toEqual([lazer]);
  });
});
