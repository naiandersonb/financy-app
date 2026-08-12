"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Loader2,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { createTransaction } from "@/app/(auth)/dashboard/actions";
import type {
  CardType,
  Category,
  PaymentMethod,
} from "@/app/core/domain/transactions/transaction.entity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CategoryPicker } from "@/components/categories/category-picker";

const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  card: "Cartão",
};

const cardTypeLabels: Record<CardType, string> = {
  credit: "Crédito",
  debit: "Débito",
};

const transactionSchema = z
  .object({
    title: z
      .string({ error: "Informe o título" })
      .trim()
      .min(1, "Informe o título")
      .max(100, "Máximo de 100 caracteres"),
    amount: z
      .string({ error: "Informe o valor" })
      .min(1, "Informe o valor")
      .refine(
        (value) => !Number.isNaN(Number(value)),
        "Informe um valor válido"
      )
      .refine((value) => Number(value) > 0, "O valor deve ser maior que zero"),
    transaction_date: z
      .string({ error: "Informe a data" })
      .min(1, "Informe a data"),
    category_id: z
      .string({ error: "Selecione uma categoria" })
      .min(1, "Selecione uma categoria"),
    type: z.enum(["expense", "income"]),
    payment_method: z.enum(["pix", "cash", "card"]),
    card_type: z.enum(["credit", "debit"]).nullable(),
    notes: z.string().trim().max(500, "Máximo de 500 caracteres").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.payment_method === "card" && !data.card_type) {
      ctx.addIssue({
        code: "custom",
        path: ["card_type"],
        message: "Selecione o tipo do cartão",
      });
    }
  });

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function TransactionFormDialog({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: "",
      amount: undefined,
      transaction_date: format(new Date(), "yyyy-MM-dd"),
      category_id: "",
      type: "expense",
      payment_method: "pix",
      card_type: null,
      notes: "",
    },
  });

  const paymentMethod = useWatch({ control, name: "payment_method" });

  const onSubmit = handleSubmit(async (values) => {
    setPending(true);
    setSubmitError(null);

    const result = await createTransaction({
      title: values.title,
      amount: Number(values.amount),
      transaction_date: values.transaction_date,
      category_id: values.category_id,
      type: values.type,
      payment_method: values.payment_method,
      card_type: values.card_type,
      notes: values.notes || null,
    });

    setPending(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="secondary">
            <Plus /> Nova transação
          </Button>
        }
      />

      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
          <DialogDescription>
            Registre uma nova movimentação financeira.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="grid gap-6">
          <Field>
            <FieldLabel htmlFor="transaction-title">Título</FieldLabel>
            <FieldContent>
              <Input
                id="transaction-title"
                placeholder="Ex.: Supermercado"
                aria-invalid={errors.title ? true : undefined}
                {...register("title")}
              />
              <FieldError errors={[errors.title]} />
            </FieldContent>
          </Field>

          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Field>
                <FieldLabel>Tipo</FieldLabel>
                <FieldContent>
                  <ToggleGroup
                    multiple={false}
                    value={[field.value]}
                    onValueChange={(value) =>
                      field.onChange(value[0] ?? "expense")
                    }
                    variant="outline"
                  >
                    <ToggleGroupItem value="expense">
                      <BanknoteArrowUp />
                      Despesa
                    </ToggleGroupItem>
                    <ToggleGroupItem value="income">
                      <BanknoteArrowDown />
                      Receita
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <FieldError errors={[errors.type]} />
                </FieldContent>
              </Field>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="transaction-amount">Valor</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon align="inline-start">R$</InputGroupAddon>
                  <InputGroupInput
                    id="transaction-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    inputMode="decimal"
                    placeholder="0,00"
                    aria-invalid={errors.amount ? true : undefined}
                    {...register("amount")}
                  />
                </InputGroup>
                <FieldError errors={[errors.amount]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="transaction-date">Data</FieldLabel>
              <FieldContent>
                <Input
                  id="transaction-date"
                  type="date"
                  aria-invalid={errors.transaction_date ? true : undefined}
                  {...register("transaction_date")}
                />
                <FieldError errors={[errors.transaction_date]} />
              </FieldContent>
            </Field>
          </div>

          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <FieldContent>
                  <CategoryPicker
                    categories={categories}
                    value={field.value}
                    onValueChange={field.onChange}
                    invalid={errors.category_id ? true : undefined}
                  />
                  <FieldError errors={[errors.category_id]} />
                </FieldContent>
              </Field>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Forma de pagamento</FieldLabel>
                  <FieldContent>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== "card") {
                          setValue("card_type", null);
                        }
                      }}
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={errors.payment_method ? true : undefined}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(paymentMethodLabels) as [
                            PaymentMethod,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.payment_method]} />
                  </FieldContent>
                </Field>
              )}
            />

            {paymentMethod === "card" && (
              <Controller
                control={control}
                name="card_type"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Tipo do cartão</FieldLabel>
                    <FieldContent>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={errors.card_type ? true : undefined}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            Object.entries(cardTypeLabels) as [
                              CardType,
                              string,
                            ][]
                          ).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[errors.card_type]} />
                    </FieldContent>
                  </Field>
                )}
              />
            )}
          </div>

          <Field>
            <FieldLabel htmlFor="transaction-notes">
              Observações{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="transaction-notes"
                placeholder="Detalhes adicionais..."
                aria-invalid={errors.notes ? true : undefined}
                {...register("notes")}
              />
              <FieldError errors={[errors.notes]} />
            </FieldContent>
          </Field>

          {submitError && (
            <p className="text-sm font-normal text-destructive">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
