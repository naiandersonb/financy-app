# T-018 — Editar lançamento pela lista

| Campo | Valor |
|-------|-------|
| Spec | [04 — Lançamentos](../specs/04-lancamentos.md), regra 2 e "Editar abre o mesmo diálogo já preenchido" |
| Status | Concluída (falta conferir no navegador os critérios 1 e 2) |
| Depende de | [T-017](T-017-criar-lancamento.md) |
| Bloqueia | — |

## Comportamento

Cada linha da lista ganha a ação **Editar**, que abre o diálogo preenchido. Ao salvar, a lista
reflete a mudança; se a data mudar para outro mês, o lançamento sai da lista do mês atual.

## Escopo

`presentation`: botão de edição (o `TransactionDialog` em modo edição já existe) em cada linha do
`transaction-list.tsx`, recebendo a action, o mês e as categorias por prop; o rótulo acessível passa
a incluir a descrição ("Editar lançamento Aluguel"), para distinguir as linhas; `app`: a página
repassa `saveTransaction`.

## Critérios de aceite

- [ ] Editar o valor → a lista mostra o novo valor. *(critério 6; os totais vêm na spec 05)*
- [ ] Mudar a data para outro mês → o lançamento some do mês atual. *(critério 7)*
- [x] Gate de qualidade verde.

## Tamanho

Medido: 3 arquivos de produção, ~25 linhas.
