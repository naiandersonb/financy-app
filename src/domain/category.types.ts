import type { TransactionKind } from "./transaction.types";

export type Category = {
  id: string;
  kind: TransactionKind;
  name: string;
  /** Cor hexadecimal `#rrggbb`. */
  backgroundColor: string;
  /** Cor hexadecimal `#rrggbb`. */
  textColor: string;
};
