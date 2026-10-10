"use client";

// Cliente: monta aqui a função que chama a Server Action com o id; funções criadas no servidor
// não podem ser passadas a componentes de cliente.
import type { Transaction } from "@/domain";
import { ConfirmDeleteButton } from "@/presentation/components/confirm-delete-button";
import type { Result } from "@/shared";
import { signedAmount } from "../view-models/signed-amount";

export type DeleteTransactionAction = (id: string) => Promise<Result>;

type DeleteTransactionButtonProps = {
  transaction: Transaction;
  onDelete: DeleteTransactionAction;
};

export function DeleteTransactionButton({ transaction, onDelete }: DeleteTransactionButtonProps) {
  return (
    <ConfirmDeleteButton
      triggerLabel={`Excluir lançamento ${transaction.description}`}
      title="Excluir lançamento?"
      description="O lançamento será excluído de vez. Essa ação não pode ser desfeita."
      confirmLabel="Excluir"
      pendingLabel="Excluindo…"
      onConfirm={() => onDelete(transaction.id)}
    >
      <p className="text-sm">
        <span className="font-medium">{transaction.description}</span>
        {" · "}
        <span className="tabular-nums">{signedAmount(transaction).text}</span>
      </p>
    </ConfirmDeleteButton>
  );
}
