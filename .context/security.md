# Segurança — CRM

## Modelo de acesso
- Cadastro **aberto**: qualquer e-mail válido pode criar conta (`emailSchema`, zod). Confirmação de e-mail via Supabase Auth.
- Toda pessoa autenticada acessa **todos** os clientes (RLS `authenticated`). Decisão de produto: CRM compartilhado, sem silos por dono.

## RLS (por tabela)
- `clientes` / `tarefas`: CRUD para `authenticated` (acesso compartilhado, intencional).
- `atividades`: select/insert para `authenticated`; **insert exige `autor_id = auth.uid()`**; delete só do próprio autor.
- `audit_log`: select/insert para `authenticated`; **insert exige `ator_id = auth.uid()`**; sem update/delete (imutável).
- `profiles`: select para toda a equipe; insert/update só do próprio (`auth.uid() = id`).

## Decisões de hardening (advisors)
- Funções de trigger (`handle_new_user`): `EXECUTE` revogado de `anon/authenticated/public` (não são RPC).
- `pg_trgm` movido para o schema `extensions` (fora de `public`).
- Sessão renovada a cada request no `proxy.ts` via `supabase.auth.getUser()` (nunca confiar em `getSession()` no servidor).

## Pendência (config no painel Supabase, fora do código)
- **Leaked Password Protection** está **desligado**. Ligar em Auth → Password Protection
  (checagem HaveIBeenPwned). Recomendado antes de abrir o cadastro.
- Confirmar que **Confirm email** está ligado para o fluxo de verificação funcionar.

## Segredos
- Nada de service_role no cliente. App usa só a **publishable key** (anon) em `NEXT_PUBLIC_*`.
- Token do MCP fica em env var, fora do versionamento.
