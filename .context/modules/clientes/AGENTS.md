# Módulo: clientes

Núcleo do CRM — cadastro, listagem, funil, atividades e tarefas por cliente.

## Arquivos
- `src/app/(app)/clientes/page.tsx` — lista (busca, filtros, ordenação, paginação, seleção/bulk).
- `src/app/(app)/clientes/[id]/page.tsx` — detalhe (cabeçalho, timeline, tarefas).
- `src/app/(app)/clientes/actions.ts` — CRUD, soft delete, restaurar, mudar estágio, bulk, import CSV.
- `src/app/(app)/clientes/[id]/actions.ts` — atividades e tarefas.
- `src/app/(app)/funil/` — Kanban (drag-and-drop entre estágios).
- `_components/` — `clientes-view`, `cliente-form`, `importar-modal`, `timeline`, `tarefas-cliente`, `detail-header`, `kanban-board`.

## Dados (tabela `clientes`)
`nome` (obrigatório), `email`, `telefone` (só dígitos no banco; máscara na UI), `empresa`,
`estagio` (enum check), `owner_id → profiles`, `tags text[]`, `deleted_at` (soft delete),
`created_at`, `updated_at`.

Relacionadas: `atividades` (timeline), `tarefas` (follow-ups), ambas `on delete cascade`.

## Regras
- **Listagens filtram `deleted_at is null`.** Remover = setar `deleted_at`; restaurar = limpar.
- **Busca** usa `or(ilike)` em nome/email/empresa (índices trigram). `q` é sanitizado antes do `or()`.
- **Estágios**: fonte única em `lib/constants.ts` (`ESTAGIOS`, `ESTAGIO_LABEL`, `ESTAGIO_STYLE`). Mudar estágio (form, bulk ou Kanban) chama `mudarEstagio`/`bulkEstagio`.
- **Toda escrita registra audit** via `registrarAudit` (best-effort).
- **Validação**: `clienteSchema` (zod) no server; máscara/preview no client.

## Import/Export CSV
`lib/csv.ts`: `exportarCsv` (UTF-8 + BOM, `;`) e `parseCsv` (detecta separador e colunas nome/email/telefone/empresa). Import via action `importarClientes` (máx. 1000 linhas/lote).
