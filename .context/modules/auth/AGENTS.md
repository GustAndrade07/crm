# Módulo: auth

Autenticação e sessão da equipe.

## Arquivos
- `src/app/(auth)/` — telas: `login`, `cadastro`, `recuperar-senha`, `redefinir-senha` + `actions.ts`.
- `src/app/auth/callback/route.ts` — troca `code` por sessão (confirmação de e-mail e reset).
- `src/lib/supabase/{client,server,middleware}.ts` — clients Supabase.
- `src/proxy.ts` — renova sessão e protege rotas (Next 16).
- `src/lib/auth.ts` — `requireUser()` para Server Components/Actions.

## Fluxos
- **Cadastro**: `signUp` com `data.nome` (alimenta o trigger `handle_new_user` → cria `profiles`). E-mail de confirmação aponta para `/auth/callback?next=/dashboard`. Aberto a qualquer e-mail válido.
- **Login**: `signInWithPassword`; redireciona para `?redirect` ou `/dashboard`.
- **Recuperar senha**: `resetPasswordForEmail` → `/auth/callback?next=/redefinir-senha`. Resposta neutra (não revela existência do e-mail).
- **Redefinir**: `updateUser({ password })` após o callback abrir sessão de recovery.
- **Logout**: action `sair()`.

## Proteção de rotas
`PUBLIC_PATHS` em `lib/supabase/middleware.ts`. Tudo fora dali exige sessão. Logado em `/login` ou `/cadastro` é redirecionado ao dashboard.

## Cuidados
- No servidor use sempre `getUser()` (valida o token), nunca `getSession()`.
- Não rodar lógica entre `createServerClient` e `getUser()` no proxy.
