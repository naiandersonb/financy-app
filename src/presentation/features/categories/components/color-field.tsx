"use client";

import { useId, useState } from "react";
import { Input } from "@/presentation/components/input";
import { Label } from "@/presentation/components/label";
import { parseHexColor } from "@/shared";

type ColorFieldProps = {
  label: string;
  /** Nome do campo hexadecimal no formulário. */
  name: string;
  defaultValue: string;
};

/** Seletor de cor nativo e campo hexadecimal, sempre sincronizados. */
export function ColorField({ label, name, defaultValue }: ColorFieldProps) {
  const id = useId();
  const [hex, setHex] = useState(defaultValue);
  // O seletor nativo só aceita #rrggbb em minúsculas; enquanto o texto for inválido, mantém a última cor válida.
  const [pickerValue, setPickerValue] = useState(defaultValue.toLowerCase());

  function handleHexChange(value: string) {
    setHex(value);
    if (parseHexColor(value)) setPickerValue(value.toLowerCase());
  }

  function handlePickerChange(value: string) {
    setPickerValue(value);
    setHex(value);
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
          value={hex}
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
