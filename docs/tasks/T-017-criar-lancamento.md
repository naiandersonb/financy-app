# T-017 — Criar lançamento pela tela principal

| Campo | Valor |
|-------|-------|
| Spec | [04 — Lançamentos](../specs/04-lancamentos.md), "Campos", "Categorias" e regras 3 e 5 |
| Status | Concluída (falta conferir no navegador o critério 1) |
| Depende de | [T-016](T-016-tela-lista-lancamentos.md) e [T-015](T-015-dialogo-lancamento-mantem-campos.md) |
| Bloqueia | T-018 |

## Comportamento

Na tela principal, o botão **"Novo lançamento"** abre o diálogo que já existe (agora com as
categorias do usuário). Ao lado do seletor de categoria aparece o selo da categoria escolhida, com as
cores dela. Ao salvar, o lançamento aparece na lista do mês da sua data, sem recarregar a página.

## Escopo

- `presentation`: selo da categoria escolhida no `transaction-dialog.tsx`.
- `app`: a página passa a renderizar `<TransactionDialog onSave={saveTransaction} categories={…} />`.

A validação no servidor, o caso de uso e a action já existem e têm testes (spec 01 e T-009).

## Critérios de aceite

- [ ] Formulário correto → o lançamento aparece na lista do mês da sua data. *(critério 1)*
- [x] Valor `0`, negativo ou com mais de 2 casas → erro, nada gravado. *(critério 2)*
- [x] Descrição vazia ou com mais de 120 caracteres → erro. *(critério 3)*
- [x] Categoria de outro tipo ou de outro usuário (requisição forjada) → recusada pelo servidor. *(critério 4; já coberto pelos testes do caso de uso e de integração)*
- [x] O selo ao lado do seletor acompanha a categoria escolhida.
- [x] Gate de qualidade verde.

## Tamanho

Medido: 2 arquivos de produção, ~30 linhas.
