import { CircleAlert, CircleCheck } from "lucide-react";
import { MIN_CATEGORY_CONTRAST } from "@/domain";
import { cn, contrastRatio } from "@/shared";

type ContrastIndicatorProps = { backgroundColor: string; textColor: string };

const oneDecimal = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Arredonda para baixo, para nunca exibir "4,5:1" num contraste reprovado de 4,49:1. */
function formatRatio(ratio: number): string {
  return `${oneDecimal.format(Math.floor(ratio * 10) / 10)}:1`;
}

export function ContrastIndicator({ backgroundColor, textColor }: ContrastIndicatorProps) {
  const ratio = contrastRatio(backgroundColor, textColor);
  const readable = ratio !== null && ratio >= MIN_CATEGORY_CONTRAST;

  let message: string;
  if (ratio === null) message = "Informe as duas cores no formato #rrggbb.";
  else if (readable) message = `Contraste ${formatRatio(ratio)} — bom`;
  else message = `Pouco contraste (${formatRatio(ratio)}): o nome pode ficar difícil de ler.`;

  const Icon = readable ? CircleCheck : CircleAlert;
  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-1.5 text-sm",
        readable ? "text-muted-foreground" : "text-destructive",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
