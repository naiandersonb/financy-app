"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { Category } from "@/domain";
import { Button } from "@/presentation/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/dialog";
import type { Result } from "@/shared";
import { CategoryBadge } from "./category-badge";

export type DeleteCategoryAction = (id: string) => Promise<Result>;

type DeleteCategoryButtonProps = {
  category: Category;
  onDelete: DeleteCategoryAction;
};

/** Pede confirmação antes de remover e mostra o motivo quando a remoção é bloqueada. */
export function DeleteCategoryButton({ category, onDelete }: DeleteCategoryButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setError(null);
  }

  function confirm() {
    startTransition(async () => {
      const result = await onDelete(category.id);
      if (result.ok) handleOpenChange(false);
      else setError(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remover categoria ${category.name}`}
          />
        }
      >
        <Trash2 />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover categoria?</DialogTitle>
          <DialogDescription>
            A categoria será removida de vez. Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div>
          <CategoryBadge category={category} />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <Button type="button" variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? "Removendo…" : "Remover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
