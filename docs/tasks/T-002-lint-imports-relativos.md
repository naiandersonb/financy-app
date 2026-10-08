# T-002 — Barrar imports relativos entre camadas no ESLint

| Campo | Valor |
|-------|-------|
| Spec | [01 — Fundação](../specs/01-fundacao.md), parte A3 (travas automáticas) |
| Status | A fazer |
| Depende de | — |
| Bloqueia | — |

## Problema

A regra de dependência entre camadas em `eslint.config.mjs` usa `no-restricted-imports` com
padrões de alias (`@/infrastructure`, `@/main`…). Um import **relativo** que atravesse camadas não
é reconhecido e passa no lint. Exemplo, dentro de `src/presentation/`:

```ts
import { SupabaseAuthGateway } from "../../infrastructure/supabase/supabase-auth-gateway";
```

Hoje nenhum arquivo faz isso (verificado na implementação da spec 01), mas nada impede que aconteça.

## Solução proposta

- Em cada camada, proibir imports relativos que saiam da pasta da camada (padrões como
  `../**/infrastructure/**`, `../**/main/**`, ou, mais simples, qualquer `../../*` a partir da raiz
  da camada), exigindo o alias `@/` para importar de outra camada.
- Imports relativos **dentro** da mesma camada continuam permitidos.
- Não adicionar dependência nova (sem `eslint-plugin-boundaries`), salvo se a regra nativa não
  der conta; nesse caso, justificar na spec 01.

## Passos

- [ ] Ajustar `eslint.config.mjs`.
- [ ] Provar a trava com arquivos temporários: um import relativo proibido por camada deve falhar no lint, e um import relativo dentro da própria camada deve passar.
- [ ] `npm run lint` verde no código atual.

## Pronto quando

- [ ] Um import relativo de `src/presentation/` para `src/infrastructure/` faz `npm run lint` falhar.
- [ ] Gate de qualidade verde.
