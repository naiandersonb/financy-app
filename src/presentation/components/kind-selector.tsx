import type { TransactionKind } from "@/domain";
import { cn } from "@/shared";

type KindSelectorProps = {
  value: TransactionKind;
  onChange: (kind: TransactionKind) => void;
  /** Mostra o tipo sem permitir trocá-lo (ex.: edição de categoria). */
  disabled?: boolean;
};

/** Grupo de rádios "Tipo" (Despesa/Receita), enviado no formulário como `kind`. */
export function KindSelector({ value, onChange, disabled = false }: KindSelectorProps) {
  return (
    <fieldset className="grid grid-cols-2 gap-2 disabled:opacity-60" disabled={disabled}>
      <legend className="sr-only">Tipo</legend>
      <KindOption kind="expense" label="Despesa" selected={value} onSelect={onChange} />
      <KindOption kind="income" label="Receita" selected={value} onSelect={onChange} />
    </fieldset>
  );
}

function KindOption({
  kind,
  label,
  selected,
  onSelect,
}: {
  kind: TransactionKind;
  label: string;
  selected: TransactionKind;
  onSelect: (kind: TransactionKind) => void;
}) {
  const isSelected = kind === selected;
  return (
    <label
      className={cn(
        "flex h-9 cursor-pointer items-center in-disabled:cursor-not-allowed justify-center rounded-md border text-sm font-medium transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
        isSelected && kind === "expense" && "border-destructive/40 bg-destructive/10 text-destructive",
        isSelected && kind === "income" && "border-primary/40 bg-primary/10 text-primary",
        !isSelected && "text-muted-foreground hover:bg-muted",
      )}
    >
      <input
        type="radio"
        name="kind"
        value={kind}
        checked={isSelected}
        onChange={() => onSelect(kind)}
        className="sr-only"
      />
      {label}
    </label>
  );
}
