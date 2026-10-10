"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
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
import { Input } from "@/presentation/components/input";
import { Label } from "@/presentation/components/label";
import { NativeSelect, NativeSelectOption } from "@/presentation/components/native-select";
import { CategoryBadge } from "@/presentation/features/categories";
import type { Result } from "@/shared";

export type SaveBudgetAction = (previous: Result | null, formData: FormData) => Promise<Result>;

type BudgetDialogProps = {
  /** Categorias de despesa que ainda não têm orçamento. */
  categories: Category[];
  onSave: SaveBudgetAction;
};

export function BudgetDialog({ categories, onSave }: BudgetDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus /> Definir limite
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir limite</DialogTitle>
          <DialogDescription>
            O limite vale para todos os meses, até ser alterado.
          </DialogDescription>
        </DialogHeader>
        <BudgetForm categories={categories} onSave={onSave} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function BudgetForm({
  categories,
  onSave,
  onSaved,
}: BudgetDialogProps & { onSaved: () => void }) {
  // Campos controlados: o React 19 reseta os não controlados ao fim da action, e o usuário
  // perderia o que digitou quando o servidor devolve erro.
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [limit, setLimit] = useState("");
  const [state, formAction, pending] = useActionState(
    async (previous: Result | null, formData: FormData) => {
      const result = await onSave(previous, formData);
      if (result.ok) onSaved();
      return result;
    },
    null,
  );
  // Só visual: o nome já está no seletor, o selo mostra as cores da categoria escolhida.
  const selected = categories.find((category) => category.id === categoryId);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="budget-category">Categoria</Label>
        <div className="flex items-center gap-3">
          <NativeSelect
            id="budget-category"
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="min-w-0 flex-1"
          >
            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {selected && (
            <span aria-hidden="true">
              <CategoryBadge category={selected} />
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="budget-limit">Limite mensal (R$)</Label>
        <Input
          id="budget-limit"
          name="limit"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          required
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
          placeholder="0,00"
        />
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
