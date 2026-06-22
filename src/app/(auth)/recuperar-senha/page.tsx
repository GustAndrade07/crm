"use client";

import Link from "next/link";
import { useActionState } from "react";
import { recuperarSenha, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { AlertCircle, MailCheck } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    recuperarSenha,
    {},
  );

  if (state.ok) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          Verifique seu e-mail
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
        Recuperar senha
      </h1>
      <p className="mt-1 text-sm text-muted">
        Enviaremos um link para você criar uma nova senha.
      </p>

      {state.error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={action} className="mt-6 space-y-4">
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
        <Button type="submit" loading={pending} className="w-full justify-center">
          Enviar link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
