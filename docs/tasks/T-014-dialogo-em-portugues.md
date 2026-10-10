# T-014 — Textos do diálogo em português

| Campo | Valor |
|-------|-------|
| Spec | Constituição, seção Convenções (textos de UI em pt-BR) e Acessibilidade |
| Status | Concluída |
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
- O diálogo de lançamento troca o botão de rodapé automático por um "Cancelar" próprio, igual ao
  diálogo de categoria.

## Critérios de aceite

- [x] Nenhum texto "Close" visível ou anunciado no app (`grep` em `src/` não encontra).
- [x] `dialog.tsx` fora da exclusão de cobertura e com testes.
- [x] Gate de qualidade verde.

## Tamanho

Medido: 3 arquivos (incluindo `jest.config.ts`), ~6 linhas, mais os testes do `dialog.tsx`.
