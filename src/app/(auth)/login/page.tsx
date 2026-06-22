"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { entrar, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { AlertCircle } from "lucide-react";

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";
  const erroUrl = params.get("erro");
  const [state, action, pending] = useActionState<ActionState, FormData>(
    entrar,
    {},
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Entrar
      </h1>
      <p className="mt-1 text-sm text-muted">
        Acesse o CRM com sua conta da equipe.
      </p>

      {(state.error || erroUrl) && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          {state.error ?? erroUrl}
        </div>
      )}

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={redirect} />
        <Field label="E-mail" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            required
          />
        </Field>
        <Field label="Senha" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </Field>
        <div className="flex justify-end">
          <Link
            href="/recuperar-senha"
            className="text-sm text-primary hover:underline"
          >
            Esqueci a senha
          </Link>
        </div>
        <Button type="submit" loading={pending} className="w-full justify-center">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Novo na equipe?{" "}
        <Link href="/cadastro" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
