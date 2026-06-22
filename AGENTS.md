<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CRM — fonte de verdade

CRM interno para a equipe gerenciar clientes: cadastro, funil, atividades,
tarefas e analytics. Acesso para qualquer pessoa com conta.

## Stack
- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS 4** (tema claro/escuro por classe, tokens em `globals.css`)
- **Supabase** (Postgres 17, Auth, RLS) — projeto `crm` (`qqnxsopedzahgxjyftkn`, região sa-east-1)
- **Recharts** (gráficos), **lucide-react** (ícones), **zod** (validação)

## Convenções Next 16 (importantes)
- O antigo `middleware.ts` virou **`src/proxy.ts`** (export `proxy`). É onde a sessão Supabase é renovada e as rotas são protegidas.
- `cookies()`, `headers()`, `params` e `searchParams` são **assíncronos** — sempre `await`.
- Server Components por padrão; `"use client"` só onde há interação.
- Mutações via **Server Actions** (`actions.ts` por módulo), com `revalidatePath`.

## Estrutura
```
src/
  proxy.ts                      # renovação de sessão + proteção de rota
  lib/
    supabase/{client,server,middleware}.ts
    database.types.ts           # tipos gerados do schema
    auth.ts                     # requireUser()
    audit.ts                    # registrarAudit()
    validation.ts (zod) · format.ts · constants.ts · csv.ts · utils.ts
  components/
    ui/                         # design system (button, field, modal, toast, primitives)
    app-shell/                  # sidebar + topbar
    logo · theme-toggle · estagio-badge
  app/
    (auth)/                     # login, cadastro, recuperar/redefinir senha + actions
    auth/callback/route.ts      # troca de código (confirmação de e-mail / reset)
    (app)/                      # área logada (layout exige sessão)
      dashboard · clientes · clientes/[id] · funil · tarefas
```

## Camada de contexto
Cada módulo tem seu doc em `.context/modules/<modulo>/AGENTS.md`. Convenções da stack
em `.context/conventions.md`; decisões de segurança em `.context/security.md`.
**Doc acompanha a feature** — mudou comportamento, atualize o doc do módulo.

## Regras de domínio
- **Estágios do funil** (fonte única em `src/lib/constants.ts`): `lead → qualificado → ativo → inativo`.
- **Remoção é soft delete** (`clientes.deleted_at`). Toda listagem filtra `deleted_at is null`. Restauração pela lixeira.
- **Acesso compartilhado**: toda a equipe autenticada gerencia todos os clientes (RLS `authenticated`). Não há escopo por dono — `owner_id` é só atribuição/visão.
- **Audit log** é imutável (insert/select). Autoria de atividade/audit travada em `auth.uid()`.

## MCP (local)
Este projeto usa o MCP do Supabase. Crie um `.mcp.json` na raiz (não versionar o token):
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--read-only", "--project-ref=qqnxsopedzahgxjyftkn"],
      "env": { "SUPABASE_ACCESS_TOKEN": "<seu-token>" }
    }
  }
}
```

## Variáveis de ambiente
`.env.local` (já configurado):
- `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key)
