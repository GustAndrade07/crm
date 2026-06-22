# Módulo: dashboard

Analytics e visão geral da base.

## Arquivos
- `src/app/(app)/dashboard/page.tsx` — server: busca clientes + audit log, calcula KPIs e séries.
- `src/app/(app)/dashboard/_components/charts.tsx` — client: `CadastrosChart` (área), `EstagioChart` (barras), via Recharts.
- `src/app/(app)/tarefas/page.tsx` — visão global de tarefas da equipe.

## Métricas calculadas (em JS, sobre os clientes não deletados)
- Total de clientes; novos no mês; crescimento vs. mês anterior.
- Taxa de conversão (`ativos / total`).
- "No funil" (leads + qualificados).
- Série de cadastros dos últimos 6 meses.
- Distribuição por estágio; top 5 empresas.
- Atividade recente (últimas 8 do `audit_log`, com autor).

## Cuidados
- Recharts é client-only — fica em `_components/charts.tsx` com `"use client"`.
- Cores dos gráficos espelham `ESTAGIO_STYLE`; tooltips usam tokens do tema.
- Para bases grandes, as agregações são feitas com `limit 5000`. Se a base crescer muito, migrar para contagens agregadas no Postgres (views/RPC).
