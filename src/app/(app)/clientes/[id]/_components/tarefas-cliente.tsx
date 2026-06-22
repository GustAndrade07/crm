"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { formatData } from "@/lib/format";
import {
  adicionarTarefa,
  toggleTarefa,
  removerTarefa,
  type DetailActionState,
} from "../actions";
import type { Profile } from "@/lib/database.types";

type TarefaView = {
  id: string;
  titulo: string;
  due_date: string | null;
  concluida: boolean;
  responsavel_id: string | null;
};

export function TarefasCliente({
  clienteId,
  tarefas,
  owners,
}: {
  clienteId: string;
  tarefas: TarefaView[];
  owners: Pick<Profile, "id" | "nome">[];
}) {
  const [state, action, pending] = useActionState<DetailActionState, FormData>(
    adicionarTarefa,
    {},
  );
  const [adding, setAdding] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Fecha o formulário ao concluir a Server Action.
    if (state.ok) {
      formRef.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdding(false);
    }
  }, [state]);

  const hoje = new Date().toISOString().slice(0, 10);
  const pendentes = tarefas.filter((t) => !t.concluida);
  const feitas = tarefas.filter((t) => t.concluida);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Tarefas
          {pendentes.length > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {pendentes.length}
            </span>
          )}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus className="size-4" /> Nova
        </Button>
      </div>

      {adding && (
        <form ref={formRef} action={action} className="mt-3 space-y-2">
          <input type="hidden" name="cliente_id" value={clienteId} />
          <Input name="titulo" placeholder="O que precisa ser feito?" required autoFocus />
          {state.error && <p className="text-xs text-danger">{state.error}</p>}
          <div className="flex gap-2">
            <Input name="due_date" type="date" className="w-auto" />
            <Select name="responsavel_id" defaultValue="" className="w-auto">
              <option value="">Responsável</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome ?? "Equipe"}
                </option>
              ))}
            </Select>
            <Button type="submit" size="sm" loading={pending} className="ml-auto">
              Adicionar
            </Button>
          </div>
        </form>
      )}

      <ul className="mt-4 space-y-2">
        {tarefas.length === 0 && !adding && (
          <li className="text-sm text-muted">Nenhuma tarefa.</li>
        )}
        {[...pendentes, ...feitas].map((t) => {
          const atrasada =
            !t.concluida && t.due_date != null && t.due_date < hoje;
          return (
            <li
              key={t.id}
              className="group flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <input
                type="checkbox"
                checked={t.concluida}
                onChange={() => toggleTarefa(t.id, !t.concluida, clienteId)}
                className="size-4 accent-[var(--primary)]"
                aria-label="Concluir tarefa"
              />
              <span
                className={cn(
                  "flex-1 text-sm",
                  t.concluida && "text-muted line-through",
                )}
              >
                {t.titulo}
              </span>
              {t.due_date && (
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    atrasada ? "text-danger" : "text-muted",
                  )}
                >
                  <CalendarDays className="size-3.5" />
                  {formatData(t.due_date)}
                </span>
              )}
              <button
                onClick={() => removerTarefa(t.id, clienteId)}
                className="opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remover tarefa"
              >
                <Trash2 className="size-3.5 text-muted hover:text-danger" />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
