"use client";

import Link from "next/link";
import { CalendarDays, CheckSquare } from "lucide-react";
import { Card, EmptyState, Avatar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { formatData } from "@/lib/format";
import { toggleTarefa } from "@/app/(app)/clientes/[id]/actions";

export type TarefaItem = {
  id: string;
  titulo: string;
  due_date: string | null;
  concluida: boolean;
  cliente_id: string | null;
  cliente_nome: string | null;
  responsavel_nome: string | null;
};

function Linha({ t }: { t: TarefaItem }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const atrasada = !t.concluida && t.due_date != null && t.due_date < hoje;
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={t.concluida}
        onChange={() => toggleTarefa(t.id, !t.concluida, t.cliente_id ?? undefined)}
        className="size-4 accent-[var(--primary)]"
        aria-label="Concluir tarefa"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", t.concluida && "text-muted line-through")}>
          {t.titulo}
        </p>
        {t.cliente_id && t.cliente_nome && (
          <Link
            href={`/clientes/${t.cliente_id}`}
            className="text-xs text-muted hover:text-primary"
          >
            {t.cliente_nome}
          </Link>
        )}
      </div>
      {t.due_date && (
        <span
          className={cn(
            "flex items-center gap-1 text-xs",
            atrasada ? "text-danger" : "text-muted",
          )}
        >
          <CalendarDays className="size-3.5" /> {formatData(t.due_date)}
        </span>
      )}
      {t.responsavel_nome && (
        <Avatar nome={t.responsavel_nome} className="size-6 text-[10px]" />
      )}
    </li>
  );
}

export function TarefasLista({ tarefas }: { tarefas: TarefaItem[] }) {
  const pendentes = tarefas.filter((t) => !t.concluida);
  const feitas = tarefas.filter((t) => t.concluida);

  if (tarefas.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Nenhuma tarefa"
        description="As tarefas e follow-ups criados nos clientes aparecem aqui."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">
          Pendentes ({pendentes.length})
        </h2>
        {pendentes.length === 0 ? (
          <p className="text-sm text-muted">Tudo em dia. 🎉</p>
        ) : (
          <Card>
            <ul className="divide-y">
              {pendentes.map((t) => (
                <Linha key={t.id} t={t} />
              ))}
            </ul>
          </Card>
        )}
      </div>

      {feitas.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted">
            Concluídas ({feitas.length})
          </h2>
          <Card className="opacity-70">
            <ul className="divide-y">
              {feitas.map((t) => (
                <Linha key={t.id} t={t} />
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
