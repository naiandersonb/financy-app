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
| [T-007 — Criar categoria (com validação no servidor)](T-007-criar-categoria.md) | 03 | Concluída |
| [T-008 — Prévia ao vivo e indicador de contraste](T-008-previa-contraste.md) | 03 | Concluída |
| [T-009 — Lançamentos e orçamentos referenciam a categoria por id](T-009-referencias-por-id.md) | 03 | Concluída |
| [T-010 — Editar categoria](T-010-editar-categoria.md) | 03 | Concluída |
| [T-011 — Remover categoria (com bloqueios)](T-011-remover-categoria.md) | 03 | Concluída |
| [T-012 — Recusar chave secreta do Supabase na configuração do app](T-012-recusar-chave-secreta.md) | 01 | Concluída |
| [T-013 — Extrair o seletor de tipo e o tratamento de erros das actions](T-013-extrair-seletor-tipo-e-runner.md) | 03 | Concluída |
| [T-014 — Textos do diálogo em português](T-014-dialogo-em-portugues.md) | — | Concluída |
| [T-015 — Diálogo de lançamento mantém os campos quando há erro](T-015-dialogo-lancamento-mantem-campos.md) | 04 | Concluída |
| [T-016 — Tela principal com a lista de lançamentos do mês](T-016-tela-lista-lancamentos.md) | 04 | Concluída |
| [T-017 — Criar lançamento pela tela principal](T-017-criar-lancamento.md) | 04 | Concluída |
| [T-018 — Editar lançamento pela lista](T-018-editar-lancamento.md) | 04 | Concluída |
| [T-019 — Extrair o botão de exclusão com confirmação](T-019-extrair-confirmacao-de-exclusao.md) | 04 | Concluída |
| [T-020 — Excluir lançamento com confirmação](T-020-excluir-lancamento.md) | 04 | Concluída |
| [T-021 — Seletor de mês](T-021-seletor-de-mes.md) | 05 | Concluída |
| [T-022 — Cartões de receitas, despesas e saldo do mês](T-022-cartoes-de-resumo.md) | 05 | Concluída |
| [T-023 — Gastos por categoria do mês](T-023-gastos-por-categoria.md) | 06 | Concluída |
| [T-024 — Avatar e nome do usuário no cabeçalho](T-024-avatar-do-usuario.md) | 02 | Concluída |
| [T-025 — Seção de orçamentos do mês (acompanhamento)](T-025-secao-de-orcamentos.md) | 07 | Concluída |
| [T-026 — Definir limite de uma categoria](T-026-definir-limite.md) | 07 | Implementada |
| [T-027 — Editar o valor de um limite](T-027-editar-limite.md) | 07 | A fazer |
| [T-028 — Remover orçamento](T-028-remover-orcamento.md) | 07 | A fazer |
