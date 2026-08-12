"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { createCategory } from "@/app/(auth)/dashboard/actions";
import type { Category } from "@/app/core/domain/transactions/transaction.entity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = [
  { label: "Vermelho", value: "#f43f5e" },
  { label: "Laranja", value: "#f97316" },
  { label: "Amarelo", value: "#eab308" },
  { label: "Verde", value: "#22c55e" },
  { label: "Azul", value: "#3b82f6" },
  { label: "Roxo", value: "#a855f7" },
  { label: "Rosa", value: "#ec4899" },
  { label: "Cinza", value: "#64748b" },
] as const;

const categorySchema = z.object({
  name: z
    .string({ error: "Informe o nome da categoria" })
    .trim()
    .min(1, "Informe o nome da categoria")
    .max(40, "Máximo de 40 caracteres"),
  color: z.string({ error: "Escolha uma cor" }).min(1, "Escolha uma cor"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryFormDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (category: Category) => void;
}) {
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", color: "" },
  });

  const selectedColor = useWatch({ control, name: "color" });

  const closeDialog = () => {
    reset();
    setSubmitError(null);
    onOpenChange(false);
  };

  const onSubmit = handleSubmit(async (values) => {
    setPending(true);
    setSubmitError(null);

    const result = await createCategory({
      name: values.name,
      style: {
        backgroundColor: values.color,
        color: "hsl(0 0% 100%)",
      },
    });

    setPending(false);

    if (result.error || !result.category) {
      setSubmitError(result.error ?? "Erro ao criar categoria");
      return;
    }

    onCreated(result.category);
    closeDialog();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          reset();
          setSubmitError(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription>
            Crie uma categoria para organizar suas transações.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="grid gap-6">
          <Field>
            <FieldLabel htmlFor="category-name">Nome</FieldLabel>
            <FieldContent>
              <Input
                id="category-name"
                placeholder="Ex.: Alimentação"
                aria-invalid={errors.name ? true : undefined}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </FieldContent>
          </Field>

          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <Field>
                <FieldLabel>Cor</FieldLabel>
                <FieldContent>
                  <div
                    role="radiogroup"
                    className="flex flex-wrap items-center gap-2"
                  >
                    {CATEGORY_COLORS.map((color) => {
                      const isSelected = selectedColor === color.value;

                      return (
                        <button
                          key={color.value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={color.label}
                          title={color.label}
                          onClick={() => field.onChange(color.value)}
                          className={cn(
                            "flex size-8 items-center justify-center rounded-full transition-transform outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/30",
                            isSelected &&
                              "ring-2 ring-ring ring-offset-2 ring-offset-background"
                          )}
                          style={{ backgroundColor: color.value }}
                        >
                          {isSelected && (
                            <Check className="size-4 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <FieldError errors={[errors.color]} />
                </FieldContent>
              </Field>
            )}
          />

          {submitError && (
            <p className="text-sm font-normal text-destructive">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Criar categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
