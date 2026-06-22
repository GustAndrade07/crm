# Convenções do projeto — CRM

Perfil real detectado/decidido para este repositório.

| Aspecto | Escolha |
|---|---|
| Linguagem | TypeScript (strict) |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS 4 |
| Banco/Auth | Supabase (Postgres 17 + GoTrue + RLS) |
| Validação | zod (client + server) |
| Gráficos | Recharts |
| Ícones | lucide-react |
| Deploy alvo | Vercel |

## Padrões de código
- **Idioma**: identificadores e UI em pt-BR; nomes de tabela/coluna em pt-BR (`clientes`, `estagio`, `tarefas`).
- **Mutações**: Server Actions (`"use server"`) por módulo em `actions.ts`, sempre com `zod.safeParse` e `revalidatePath`.
- **Leitura**: Server Components consultam o Supabase direto via `createClient()` de `lib/supabase/server`.
- **Estado de UI**: `useActionState` (React 19) para formulários; feedback via `useToast`.
- **Estilo**: utilitários Tailwind + tokens CSS (`--primary`, `--surface`, etc.); helper `cn()`. Nada de CSS solto fora do design system.
- **Datas/telefone**: helpers em `lib/format.ts` (`maskTelefone`, `formatData`, `timeAgo`).

## Comandos
- `npm run dev` — desenvolvimento
- `npm run build` — build de produção (roda typecheck)
- `npm run lint` — eslint (config-next)

## Regenerar tipos do banco
Após mudar schema, regenerar `src/lib/database.types.ts` a partir do Supabase
(`generate_typescript_types`) e exportar os aliases (`Cliente`, `Profile`, etc.).
