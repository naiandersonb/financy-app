# T-008 — Prévia ao vivo e indicador de contraste

| Campo | Valor |
|-------|-------|
| Spec | [03 — Categorias](../specs/03-categorias.md), regra 2 e "Telas e interações" |
| Status | A fazer |
| Depende de | [T-007](T-007-criar-categoria.md) |
| Bloqueia | — |

## Comportamento

No diálogo de categoria, o usuário vê o selo com o nome digitado e as cores escolhidas enquanto
edita, e um indicador de contraste ("Contraste 7,2:1 — bom"). Abaixo de 4,5:1, aparece o aviso
"Pouco contraste: o nome pode ficar difícil de ler" e o botão de salvar fica desabilitado.

## Escopo

Só `presentation`: `contrast-indicator.tsx` e ajustes em `category-dialog.tsx`, usando
`contrastRatio` de `shared` (o mesmo cálculo que o servidor usa).

## Critérios de aceite cobertos

- [ ] Ao mudar a cor no seletor, o campo hexadecimal **e a prévia** se atualizam, e vice-versa. *(critério 8, completo)*
- [ ] Fundo `#ffffff` e texto `#eeeeee` → aviso de pouco contraste e botão de salvar desabilitado. *(critério 7, parte da tela)*
- [ ] O indicador mostra a razão com uma casa decimal, no formato pt-BR (`7,2:1`).
- [ ] Gate de qualidade verde.

## Tamanho

~2 arquivos de produção, ~80 linhas.
