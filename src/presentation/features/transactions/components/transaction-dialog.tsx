"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus } from "lucide-react";
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
import { NativeSelect, NativeSelectOption } from "@/presentation/components/native-select";
import {
  defaultDateInMonth,
  type Category,
  type MonthKey,
  type Transaction,
  type TransactionKind,
} from "@/domain";
import { categoriesByKind } from "@/presentation/features/categories";
import { centsToInputValue } from "@/presentation/formatters";
import type { Result } from "@/shared";

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
      {isEditing ? (
        <DialogTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label="Editar lançamento" />}
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
          <DialogTitle>{isEditing ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
          <DialogDescription>Registre uma receita ou despesa.</DialogDescription>
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
  const [kind, setKind] = useState<TransactionKind>(transaction?.kind ?? "expense");
  const [state, formAction, pending] = useActionState(
    async (previous: Result | null, formData: FormData) => {
      const result = await onSave(previous, formData);
      if (result.ok) onSaved();
      return result;
    },
    null,
  );

  const categoriesOfKind = categoriesByKind(categories)[kind];
  const defaultCategoryId =
    transaction?.kind === kind ? transaction.categoryId : categoriesOfKind[0]?.id;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {transaction && <input type="hidden" name="id" value={transaction.id} />}

      <KindSelector value={kind} onChange={setKind} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          required
          maxLength={120}
          defaultValue={transaction?.description}
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
            defaultValue={transaction ? centsToInputValue(transaction.amountCents) : undefined}
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
            defaultValue={transaction?.occurredOn ?? defaultDateInMonth(month, new Date())}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Categoria</Label>
        {/* key reinicia o valor padrão quando o tipo muda e a lista de categorias troca. */}
        <NativeSelect
          key={kind}
          id="category"
          name="categoryId"
          defaultValue={defaultCategoryId}
          className="w-full"
        >
          {categoriesOfKind.map((category) => (
            <NativeSelectOption key={category.id} value={category.id}>
              {category.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
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
