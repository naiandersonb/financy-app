"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { hasReadableContrast, type Category, type TransactionKind } from "@/domain";
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
import { parseHexColor, type Result } from "@/shared";
import { CategoryBadge } from "./category-badge";
import { ColorField } from "./color-field";
import { ContrastIndicator } from "./contrast-indicator";

export type SaveCategoryAction = (previous: Result | null, formData: FormData) => Promise<Result>;

const DEFAULT_BACKGROUND = "#e5e7eb";
const DEFAULT_TEXT = "#1f2937";

type CategoryDialogProps = {
  onSave: SaveCategoryAction;
  /** Quando informada, o diálogo edita esta categoria (o tipo não muda). */
  category?: Category;
};

export function CategoryDialog({ onSave, category }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {category ? (
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Editar categoria ${category.name}`} />
          }
        >
          <Pencil />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus /> Nova categoria
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Altere o nome e as cores do selo. O tipo não pode ser trocado."
              : "Escolha o nome, o tipo e as cores do selo."}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm onSave={onSave} category={category} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  onSave,
  category,
  onSaved,
}: CategoryDialogProps & { onSaved: () => void }) {
  // Campos controlados: o React 19 reseta os não controlados ao fim da action, e o usuário
  // perderia o que digitou quando o servidor devolve erro.
  const [name, setName] = useState(category?.name ?? "");
  const [backgroundColor, setBackgroundColor] = useState(
    category?.backgroundColor ?? DEFAULT_BACKGROUND,
  );
  const [textColor, setTextColor] = useState(category?.textColor ?? DEFAULT_TEXT);
  const [kind, setKind] = useState<TransactionKind>(category?.kind ?? "expense");
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
      {category && <input type="hidden" name="id" value={category.id} />}

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

      <KindSelector value={kind} onChange={setKind} disabled={Boolean(category)} />

      <div className="grid gap-3 sm:grid-cols-2">
        <ColorField
          label="Cor de fundo"
          name="backgroundColor"
          value={backgroundColor}
          onChange={setBackgroundColor}
        />
        <ColorField
          label="Cor do texto"
          name="textColor"
          value={textColor}
          onChange={setTextColor}
        />
      </div>

      <div
        role="group"
        aria-labelledby="category-preview-label"
        className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3"
      >
        <span id="category-preview-label" className="text-xs font-medium text-muted-foreground">
          Prévia
        </span>
        <div>
          <CategoryBadge
            category={{
              name: name.trim() || "Nome da categoria",
              // Enquanto uma cor está incompleta, a prévia usa a cor padrão daquele campo.
              backgroundColor: validColorOr(backgroundColor, DEFAULT_BACKGROUND),
              textColor: validColorOr(textColor, DEFAULT_TEXT),
            }}
          />
        </div>
        <ContrastIndicator backgroundColor={backgroundColor} textColor={textColor} />
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={pending || !hasReadableContrast(backgroundColor, textColor)}>
          {pending ? "Salvando…" : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function validColorOr(hex: string, fallback: string): string {
  return parseHexColor(hex) ? hex : fallback;
}
