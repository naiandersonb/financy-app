"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
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

type ConfirmDeleteButtonProps = {
  /** Rótulo acessível do botão de lixeira; deve dizer o que será excluído. */
  triggerLabel: string;
  title: string;
  description: string;
  /** Texto do botão de confirmação (ex.: "Remover", "Excluir"). */
  confirmLabel: string;
  pendingLabel: string;
  onConfirm: () => Promise<Result>;
  /** Conteúdo extra que identifica o item (ex.: o selo da categoria). */
  children?: ReactNode;
};

/** Botão de lixeira que pede confirmação e mostra o motivo quando a exclusão é recusada. */
export function ConfirmDeleteButton({
  triggerLabel,
  title,
  description,
  confirmLabel,
  pendingLabel,
  onConfirm,
  children,
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setError(null);
  }

  function confirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) handleOpenChange(false);
      else setError(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={triggerLabel} />}
      >
        <Trash2 />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children && <div>{children}</div>}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <Button type="button" variant="destructive" onClick={confirm} disabled={pending}>
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
