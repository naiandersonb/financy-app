import type { Metadata } from "next";
import { makeListCategories } from "@/main";
import { CategoryList } from "@/presentation/features/categories";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const listCategories = await makeListCategories();
  const categories = await listCategories();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">Categorias</h1>
      <CategoryList categories={categories} />
    </main>
  );
}
