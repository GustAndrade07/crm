"use client";

import { useActionState } from "react";
import { redefinirSenha, type ActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { AlertCircle } from "lucide-react";

export default function RedefinirSenhaPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    redefinirSenha,
    {},
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Nova senha
      </h1>
      <p className="mt-1 text-sm text-muted">
        Defina uma nova senha para sua conta.
      </p>

      {state.error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={action} className="mt-6 space-y-4">
        <Field label="Nova senha" htmlFor="password" hint="Mínimo de 8 caracteres.">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
        </Field>
        <Field label="Confirmar senha" htmlFor="confirmar">
          <Input
            id="confirmar"
            name="confirmar"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
        </Field>
        <Button type="submit" loading={pending} className="w-full justify-center">
          Salvar nova senha
        </Button>
      </form>
    </div>
  );
}
