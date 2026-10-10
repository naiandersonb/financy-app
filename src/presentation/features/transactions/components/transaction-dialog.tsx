"use client";

import {
  defaultDateInMonth,
  type Category,
  type MonthKey,
  type Transaction,
  type TransactionKind,
} from "@/domain";
import { Button } from "@/presentation/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/dialog";
import { Input } from "@/presentation/components/input";
import { KindSelector } from "@/presentation/components/kind-selector";
import { Label } from "@/presentation/components/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/presentation/components/native-select";
import { CategoryBadge, categoriesByKind } from "@/presentation/features/categories";
import { centsToInputValue } from "@/presentation/formatters";
import type { Result } from "@/shared";
import { Pencil, Plus } from "lucide-react";
import { useActionState, useState } from "react";

export type SaveTransactionAction = (
  previous: Result | null,
  formData: FormData,
) => Promise<Result>;

type TransactionDialogProps = {
  month: MonthKey;
  onSave: SaveTransactionAction;
  /** Categorias do usuário, de receita e de despesa. */
  categories: Category[];
  /** Quando informado, o diálogo edita este lançamento. */
  transaction?: Transaction;
};

export function TransactionDialog({
  month,
  onSave,
  categories,
  transaction,
}: TransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(transaction);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {transaction ? (
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Editar lançamento ${transaction.description}`}
            />
          }
        >
          <Pencil />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus /> Novo lançamento
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar lançamento" : "Novo lançamento"}
          </DialogTitle>
          <DialogDescription>
            Registre uma receita ou despesa.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          month={month}
          onSave={onSave}
          categories={categories}
          transaction={transaction}
          onSaved={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function TransactionForm({
  month,
  onSave,
  categories,
  transaction,
  onSaved,
}: TransactionDialogProps & { onSaved: () => void }) {
  const byKind = categoriesByKind(categories);
  const initialCategoryFor = (target: TransactionKind) =>
    transaction?.kind === target
      ? transaction.categoryId
      : (byKind[target][0]?.id ?? "");

  const [kind, setKind] = useState<TransactionKind>(
    transaction?.kind ?? "expense",
  );
  const [description, setDescription] = useState(
    transaction?.description ?? "",
  );
  const [amount, setAmount] = useState(
    transaction ? centsToInputValue(transaction.amountCents) : "",
  );
  const [occurredOn, setOccurredOn] = useState(
    transaction?.occurredOn ?? defaultDateInMonth(month, new Date()),
  );
  const [categoryId, setCategoryId] = useState(initialCategoryFor(kind));

  // Só visual: o nome já está no seletor, o selo mostra as cores da categoria escolhida.
  const selectedCategory = byKind[kind].find((category) => category.id === categoryId);

  function changeKind(next: TransactionKind) {
    setKind(next);
    setCategoryId(initialCategoryFor(next));
  }

  const [state, formAction, pending] = useActionState(
    async (previous: Result | null, formData: FormData) => {
      const result = await onSave(previous, formData);
      if (result.ok) onSaved();
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {transaction && <input type="hidden" name="id" value={transaction.id} />}

      <KindSelector value={kind} onChange={changeKind} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          required
          maxLength={120}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex.: Supermercado"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="occurredOn">Data</Label>
          <Input
            id="occurredOn"
            name="occurredOn"
            type="date"
            required
            value={occurredOn}
            onChange={(event) => setOccurredOn(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Categoria</Label>
        <div className="flex items-center gap-3">
          <NativeSelect
            id="category"
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="min-w-0 flex-1"
          >
            {byKind[kind].map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>
                {category.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {selectedCategory && (
            <span aria-hidden="true">
              <CategoryBadge category={selectedCategory} />
            </span>
          )}
        </div>
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
