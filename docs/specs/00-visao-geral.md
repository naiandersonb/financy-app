# Visão geral — App de finanças pessoais

## Objetivo

Permitir que uma pessoa registre suas receitas e despesas e entenda, mês a mês,
quanto entrou, quanto saiu, para onde o dinheiro foi e se ficou dentro dos
limites que definiu.

## Features da primeira versão

| # | Feature | Spec | Depende de |
|---|---------|------|------------|
| 1 | Fundação (camadas em `src/`, Jest, zod, conformidade) | [01-fundacao.md](01-fundacao.md) | — |
| 2 | Autenticação (e-mail/senha e Google) | [02-autenticacao.md](02-autenticacao.md) | 1 |
| 3 | Categorias personalizadas (nome e cores) | [03-categorias.md](03-categorias.md) | 2 |
| 4 | Lançamentos (receitas e despesas) | [04-lancamentos.md](04-lancamentos.md) | 3 |
| 5 | Resumo mensal | [05-resumo-mensal.md](05-resumo-mensal.md) | 4 |
| 6 | Gastos por categoria | [06-gastos-por-categoria.md](06-gastos-por-categoria.md) | 3, 4, 5 |
| 7 | Orçamento por categoria | [07-orcamento-por-categoria.md](07-orcamento-por-categoria.md) | 3, 4, 5 |

Ordem sugerida de implementação: 1 → 2 → 3 → 4 → 5 → 6 → 7.

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
- **Categorias:** cada usuário tem as próprias, com nome, cor de fundo e cor do texto; começa com
  um conjunto padrão (ver spec 03).
- **Idioma:** interface toda em português do Brasil.
- **Estrutura de pastas:** todo código da aplicação fica em `src/`, dividido nas camadas
  `domain`, `application`, `infrastructure`, `presentation`, `main`, `app` e `shared`; na raiz
  ficam só configurações, `public/`, `docs/` e `supabase/` (ver spec 01).
- **Responsividade:** precisa funcionar bem no celular (largura mínima de 360px).

## Modelo de dados (resumo)

```
categories
  id                uuid  PK
  user_id           uuid  FK auth.users (cascade)
  kind              'income' | 'expense'
  name              text  (1–30, único por usuário+tipo, sem diferenciar maiúsculas)
  background_color  text  '#rrggbb'
  text_color        text  '#rrggbb'
  created_at        timestamptz

transactions
  id            uuid  PK
  user_id       uuid  FK auth.users (cascade)
  kind          'income' | 'expense'
  description   text  (1–120 caracteres)
  amount_cents  bigint > 0
  category_id   uuid  FK (category_id, user_id, kind) → categories (restrict)
  occurred_on   date
  created_at    timestamptz

budgets
  user_id       uuid  FK auth.users (cascade)  ┐ PK
  category_id   uuid  FK → categories          ┘ (só categorias de despesa)
  limit_cents   bigint > 0
```

## Fora do escopo da v1

Contas bancárias e cartões, transferências, parcelamentos, lançamentos
recorrentes, importação de extrato (OFX/CSV), múltiplas moedas, metas de
economia, compartilhamento entre usuários,
exportação de relatórios e app offline.
