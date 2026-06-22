"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cadastrar, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function CadastroPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    cadastrar,
    {},
  );

  if (state.ok) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          Quase lá!
        </h1>
        <p className="mt-2 text-sm text-muted">{state.ok}</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Criar conta
      </h1>
      <p className="mt-1 text-sm text-muted">
        Crie sua conta para acessar o CRM da equipe.
      </p>

      {state.error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={action} className="mt-6 space-y-4">
        <Field label="Nome" htmlFor="nome">
          <Input id="nome" name="nome" autoComplete="name" placeholder="Seu nome" required />
        </Field>
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
        <Field
          label="Senha"
          htmlFor="password"
          hint="Mínimo de 8 caracteres."
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
        </Field>
        <Button type="submit" loading={pending} className="w-full justify-center">
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
