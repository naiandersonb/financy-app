"use client";

import { useId, useState } from "react";
import { Input } from "@/presentation/components/input";
import { Label } from "@/presentation/components/label";
import { parseHexColor } from "@/shared";

type ColorFieldProps = {
  label: string;
  /** Nome do campo hexadecimal no formulário. */
  name: string;
  value: string;
  onChange: (hex: string) => void;
};

/** Seletor de cor nativo e campo hexadecimal, sempre sincronizados. */
export function ColorField({ label, name, value, onChange }: ColorFieldProps) {
  const id = useId();
  // O seletor nativo só aceita #rrggbb em minúsculas; enquanto o texto for inválido, mantém a última cor válida.
  const [pickerValue, setPickerValue] = useState(value.toLowerCase());

  function handleHexChange(hex: string) {
    onChange(hex);
    if (parseHexColor(hex)) setPickerValue(hex.toLowerCase());
  }

  function handlePickerChange(hex: string) {
    setPickerValue(hex);
    onChange(hex);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} (seletor)`}
          value={pickerValue}
          onChange={(event) => handlePickerChange(event.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          id={id}
          name={name}
          value={value}
          onChange={(event) => handleHexChange(event.target.value)}
          required
          maxLength={7}
          spellCheck={false}
          className="font-mono"
        />
      </div>
    </div>
  );
}
