# Tarefas

Unidades de trabalho derivadas das [specs](../specs/). Cada tarefa aponta para a spec que
implementa, lista as dependências e termina com o gate de qualidade da
[constituição](../constitution.md).

Cada tarefa segue a seção "Tarefas curtas e revisáveis" da constituição: um único comportamento,
até ~300 linhas e ~10 arquivos de produção (testes não contam), corte vertical entre as camadas,
um commit por tarefa, feito só depois da aprovação de quem revisa.

Nome do arquivo: `T-<número com 3 dígitos>-<slug>.md`. Status possíveis: A fazer, Em andamento, Concluída.

| Tarefa | Spec | Status |
|--------|------|--------|
| [T-001 — Login social com Google](T-001-login-google.md) | 02 | Concluída |
| [T-002 — Barrar imports relativos entre camadas no ESLint](T-002-lint-imports-relativos.md) | 01 | A fazer |
| [T-003 — Comparação exata das rotas públicas no proxy](T-003-proxy-rotas-publicas.md) | 02 | Concluída |
| [T-004 — Teste de integração do isolamento entre usuários (RLS)](T-004-teste-integracao-rls.md) | 02 | Concluída |
| [T-005 — Tabela de categorias e categorias padrão](T-005-tabela-categorias.md) | 03 | Concluída |
| [T-006 — Página de categorias (listagem)](T-006-listar-categorias.md) | 03 | Concluída |
| [T-007 — Criar categoria (com validação no servidor)](T-007-criar-categoria.md) | 03 | A fazer |
| [T-008 — Prévia ao vivo e indicador de contraste](T-008-previa-contraste.md) | 03 | A fazer |
| [T-009 — Lançamentos e orçamentos referenciam a categoria por id](T-009-referencias-por-id.md) | 03 | A fazer |
| [T-010 — Editar categoria](T-010-editar-categoria.md) | 03 | A fazer |
| [T-011 — Remover categoria (com bloqueios)](T-011-remover-categoria.md) | 03 | A fazer |
| [T-012 — Recusar chave secreta do Supabase na configuração do app](T-012-recusar-chave-secreta.md) | 01 | Concluída |
| [T-013 — Extrair o seletor de tipo e o tratamento de erros das actions](T-013-extrair-seletor-tipo-e-runner.md) | 03 | Concluída |
