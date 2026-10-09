# T-014 — Textos do diálogo em português

| Campo | Valor |
|-------|-------|
| Spec | Constituição, seção Convenções (textos de UI em pt-BR) e Acessibilidade |
| Status | A fazer |
| Depende de | — |
| Bloqueia | — |

## Problema

O componente `src/presentation/components/dialog.tsx`, gerado pelo shadcn, tem textos fixos em
inglês:

- o botão "X" do `DialogContent` é anunciado como **"Close"** para leitores de tela;
- o `DialogFooter` com `showCloseButton` mostra um botão escrito **"Close"**, usado hoje pelo
  diálogo de lançamento.

## Solução proposta

- Trocar os textos para "Fechar" no `dialog.tsx`.
- Como o arquivo deixa de ser um componente do shadcn intocado, ele sai da lista
  `SHADCN_GENERATED_COMPONENTS` do `jest.config.ts` e ganha testes próprios (botão "X" anunciado como
  "Fechar", rodapé com o botão "Fechar").
- O diálogo de lançamento passa a mostrar "Fechar" (ou "Cancelar", para ficar igual ao diálogo de
  categoria; decidir na revisão).

## Critérios de aceite

- [ ] Nenhum texto "Close" visível ou anunciado no app (`grep` em `src/` não encontra).
- [ ] `dialog.tsx` fora da exclusão de cobertura e com testes.
- [ ] Gate de qualidade verde.

## Tamanho

1–2 arquivos de produção, ~5 linhas, mais os testes.
