# T-012 — Recusar chave secreta do Supabase na configuração do app

| Campo | Valor |
|-------|-------|
| Spec | [01 — Fundação](../specs/01-fundacao.md); constituição, seção Qualidade → Segurança ("a chave `service_role` nunca é usada no app") |
| Status | A fazer |
| Depende de | — |
| Bloqueia | — |

## Problema

Em 2026-10-09, a variável `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` do `.env.local` estava com a chave
**secreta** (`sb_secret_...`) em vez da pública. Consequências:

- o app inteiro rodava com acesso total ao banco, **ignorando o RLS**;
- verificações feitas com essa chave pareciam provar falhas de RLS que não existiam (e poderiam
  esconder falhas reais);
- por ser uma variável `NEXT_PUBLIC_`, a chave é copiada para o build. Ela só não chegou ao
  navegador porque `infrastructure` é usada apenas no servidor; um import errado num componente de
  cliente bastaria para expô-la.

Nada no código impede que o erro se repita.

## Solução proposta

Em `src/infrastructure/supabase/env.ts`, validar a chave na inicialização e **falhar com mensagem
clara** quando ela for secreta:

- prefixo `sb_secret_`;
- token JWT legado cujo payload tenha `"role": "service_role"`.

Mensagem sugerida: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY contém uma chave secreta. Use a
Publishable key (sb_publishable_...) do painel do Supabase; a chave secreta nunca deve ficar numa
variável NEXT_PUBLIC_."

## Critérios de aceite

- [ ] Com uma chave `sb_secret_...`, o app não sobe e mostra a mensagem acima.
- [ ] Com um JWT legado de `service_role`, o app não sobe e mostra a mesma mensagem.
- [ ] Com `sb_publishable_...` ou o JWT legado de `anon`, o app sobe normalmente.
- [ ] A mensagem de erro nunca inclui o valor da chave.
- [ ] Gate de qualidade verde, com a cobertura mantida.

## Tamanho

1 arquivo de produção, ~15 linhas, mais os testes.
