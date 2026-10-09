"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import type { TransactionKind } from "@/domain";
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
import { KindSelector } from "@/presentation/components/kind-selector";
import { Label } from "@/presentation/components/label";
import type { Result } from "@/shared";
import { ColorField } from "./color-field";

export type SaveCategoryAction = (previous: Result | null, formData: FormData) => Promise<Result>;

const DEFAULT_BACKGROUND = "#e5e7eb";
const DEFAULT_TEXT = "#1f2937";

type CategoryDialogProps = { onSave: SaveCategoryAction };

export function CategoryDialog({ onSave }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus /> Nova categoria
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription>Escolha o nome, o tipo e as cores do selo.</DialogDescription>
        </DialogHeader>
        <CategoryForm onSave={onSave} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({ onSave, onSaved }: CategoryDialogProps & { onSaved: () => void }) {
  // Campos controlados: o React 19 reseta os não controlados ao fim da action, e o usuário
  // perderia o que digitou quando o servidor devolve erro.
  const [name, setName] = useState("");
  const [kind, setKind] = useState<TransactionKind>("expense");
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category-name">Nome</Label>
        <Input
          id="category-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={30}
          placeholder="Ex.: Pets"
        />
      </div>

      <KindSelector value={kind} onChange={setKind} />

      <div className="grid gap-3 sm:grid-cols-2">
        <ColorField label="Cor de fundo" name="backgroundColor" defaultValue={DEFAULT_BACKGROUND} />
        <ColorField label="Cor do texto" name="textColor" defaultValue={DEFAULT_TEXT} />
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
