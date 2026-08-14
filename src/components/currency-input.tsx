"use client";

import type * as React from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAsCurrency(value: string): string {
  if (!value) return "";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "";
  return currencyFormatter.format(numeric);
}

export function CurrencyInput({
  value,
  onValueChange,
  onFocus,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">R$</InputGroupAddon>
      <InputGroupInput
        inputMode="decimal"
        placeholder="0,00"
        value={formatAsCurrency(value)}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "");
          const cents = Number(digits) / 100;
          onValueChange(cents ? String(cents) : "");
        }}
        onFocus={(event) => {
          event.target.select();
          onFocus?.(event);
        }}
        {...props}
      />
    </InputGroup>
  );
}
