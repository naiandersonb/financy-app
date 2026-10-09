import type { Metadata } from "next";
import { makeListCategories } from "@/main";
import { CategoryDialog, CategoryList } from "@/presentation/features/categories";
import { createCategory, deleteCategory, updateCategory } from "./actions";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const listCategories = await makeListCategories();
  const categories = await listCategories();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <CategoryDialog onSave={createCategory} />
      </div>
      <CategoryList
        categories={categories}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />
    </main>
  );
}
