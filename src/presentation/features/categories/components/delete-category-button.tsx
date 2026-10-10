"use client";

// Cliente: monta aqui a função que chama a Server Action com o id; funções criadas no servidor
// não podem ser passadas a componentes de cliente.
import type { Category } from "@/domain";
import { ConfirmDeleteButton } from "@/presentation/components/confirm-delete-button";
import type { Result } from "@/shared";
import { CategoryBadge } from "./category-badge";

export type DeleteCategoryAction = (id: string) => Promise<Result>;

type DeleteCategoryButtonProps = {
  category: Category;
  onDelete: DeleteCategoryAction;
};

export function DeleteCategoryButton({ category, onDelete }: DeleteCategoryButtonProps) {
  return (
    <ConfirmDeleteButton
      triggerLabel={`Remover categoria ${category.name}`}
      title="Remover categoria?"
      description="A categoria será removida de vez. Essa ação não pode ser desfeita."
      confirmLabel="Remover"
      pendingLabel="Removendo…"
      onConfirm={() => onDelete(category.id)}
    >
      <CategoryBadge category={category} />
    </ConfirmDeleteButton>
  );
}
