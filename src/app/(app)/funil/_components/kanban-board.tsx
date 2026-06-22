"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Avatar, Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  ESTAGIOS,
  ESTAGIO_LABEL,
  ESTAGIO_STYLE,
  type Estagio,
} from "@/lib/constants";
import { mudarEstagio } from "@/app/(app)/clientes/actions";
import type { Cliente, Profile } from "@/lib/database.types";

type Owner = Pick<Profile, "id" | "nome">;

export function KanbanBoard({
  inicial,
  owners,
}: {
  inicial: Cliente[];
  owners: Owner[];
}) {
  const [clientes, setClientes] = useState(inicial);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<Estagio | null>(null);
  const { toast } = useToast();

  // Re-sincroniza o estado otimista com a verdade do servidor após revalidação.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setClientes(inicial), [inicial]);

  const ownerNome = (id: string | null) =>
    id ? owners.find((o) => o.id === id)?.nome ?? "Equipe" : null;

  async function onDrop(estagio: Estagio) {
    setOver(null);
    const id = drag;
    setDrag(null);
    if (!id) return;
    const atual = clientes.find((c) => c.id === id);
    if (!atual || atual.estagio === estagio) return;

    setClientes((cs) =>
      cs.map((c) => (c.id === id ? { ...c, estagio } : c)),
    );
    try {
      await mudarEstagio(id, estagio);
    } catch {
      setClientes(inicial);
      toast("Não foi possível mover.", "error");
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {ESTAGIOS.map((estagio) => {
        const col = clientes.filter((c) => c.estagio === estagio);
        const style = ESTAGIO_STYLE[estagio];
        return (
          <div
            key={estagio}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(estagio);
            }}
            onDragLeave={() => setOver((o) => (o === estagio ? null : o))}
            onDrop={() => onDrop(estagio)}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-[var(--radius-card)] border bg-surface-2/40 transition-colors",
              over === estagio && "ring-2 ring-primary",
            )}
          >
            <div className="flex items-center gap-2 px-3 py-3">
              <span className={cn("size-2 rounded-full", style.dot)} />
              <h3 className="text-sm font-semibold text-foreground">
                {ESTAGIO_LABEL[estagio]}
              </h3>
              <span className="ml-auto text-xs text-muted">{col.length}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
              {col.map((c) => (
                <Link
                  key={c.id}
                  href={`/clientes/${c.id}`}
                  draggable
                  onDragStart={() => setDrag(c.id)}
                  onDragEnd={() => setDrag(null)}
                  className={cn(
                    "block cursor-grab rounded-lg border bg-surface p-3 shadow-sm transition-opacity active:cursor-grabbing",
                    drag === c.id && "opacity-40",
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{c.nome}</p>
                  {c.empresa && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <Building2 className="size-3" /> {c.empresa}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    {c.tags?.length > 0 ? (
                      <Badge className="bg-surface-2 text-muted ring-border">
                        {c.tags[0]}
                      </Badge>
                    ) : (
                      <span />
                    )}
                    {c.owner_id && (
                      <Avatar nome={ownerNome(c.owner_id)} className="size-6 text-[10px]" />
                    )}
                  </div>
                </Link>
              ))}
              {col.length === 0 && (
                <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted">
                  Arraste aqui
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
