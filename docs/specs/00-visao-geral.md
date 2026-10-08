# Visão geral — App de finanças pessoais

## Objetivo

Permitir que uma pessoa registre suas receitas e despesas e entenda, mês a mês,
quanto entrou, quanto saiu, para onde o dinheiro foi e se ficou dentro dos
limites que definiu.

## Features da primeira versão

| # | Feature | Spec | Depende de |
|---|---------|------|------------|
| 1 | Fundação (camadas em `src/`, Jest, zod, conformidade) | [01-fundacao.md](01-fundacao.md) | — |
| 2 | Autenticação | [02-autenticacao.md](02-autenticacao.md) | 1 |
| 3 | Lançamentos (receitas e despesas) | [03-lancamentos.md](03-lancamentos.md) | 2 |
| 4 | Resumo mensal | [04-resumo-mensal.md](04-resumo-mensal.md) | 3 |
| 5 | Gastos por categoria | [05-gastos-por-categoria.md](05-gastos-por-categoria.md) | 3, 4 |
| 6 | Orçamento por categoria | [06-orcamento-por-categoria.md](06-orcamento-por-categoria.md) | 3, 4 |

Ordem sugerida de implementação: 1 → 2 → 3 → 4 → 5 → 6.

## Decisões transversais

- **Regras globais:** tudo segue a [constituição](../constitution.md) (Clean Architecture,
  cobertura de testes > 90% por feature, Jest, zod). Toda spec tem a seção
  "Conformidade com a constituição".
- **Stack:** Next.js 16 (App Router, Server Components, Server Actions, `proxy.ts`),
  Tailwind 4, shadcn/ui (Base UI), Supabase (Auth + Postgres), zod, Jest + Testing Library.
- **Isolamento de dados:** cada usuário só enxerga e altera os próprios dados.
  Garantido por Row Level Security (RLS) no Postgres, não apenas pela UI.
- **Dinheiro:** valores guardados como inteiros em centavos (`bigint`), nunca
  `float`. Exibição em `pt-BR`, moeda BRL (ex.: `R$ 1.234,56`). Moeda única.
- **Datas:** a data de um lançamento é uma data de calendário (`date`, sem hora
  e sem fuso). O mês é sempre derivado dela.
- **Mês de referência:** a tela principal trabalha com um mês por vez,
  identificado na URL por `?mes=AAAA-MM` (compartilhável, funciona com
  voltar/avançar do navegador). Sem parâmetro, ou com valor inválido, usa o mês atual.
- **Categorias:** lista fixa definida no código nesta versão (ver spec 03).
- **Idioma:** interface toda em português do Brasil.
- **Estrutura de pastas:** todo código da aplicação fica em `src/`, dividido nas camadas
  `domain`, `application`, `infrastructure`, `presentation`, `main`, `app` e `shared`; na raiz
  ficam só configurações, `public/`, `docs/` e `supabase/` (ver spec 01).
- **Responsividade:** precisa funcionar bem no celular (largura mínima de 360px).

## Modelo de dados (resumo)

```
transactions
  id            uuid  PK
  user_id       uuid  FK auth.users (cascade)
  kind          'income' | 'expense'
  description   text  (1–120 caracteres)
  amount_cents  bigint > 0
  category      text
  occurred_on   date
  created_at    timestamptz

budgets
  user_id       uuid  FK auth.users (cascade)  ┐ PK
  category      text                          ┘
  limit_cents   bigint > 0
```

## Fora do escopo da v1

Contas bancárias e cartões, transferências, parcelamentos, lançamentos
recorrentes, importação de extrato (OFX/CSV), múltiplas moedas, metas de
economia, compartilhamento entre usuários, categorias personalizadas,
exportação de relatórios e app offline.
