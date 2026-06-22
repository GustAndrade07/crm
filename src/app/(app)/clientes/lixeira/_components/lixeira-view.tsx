"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Card, EmptyState, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatData } from "@/lib/format";
import { restaurarCliente } from "../../actions";
import type { Cliente } from "@/lib/database.types";

export function LixeiraView({ clientes }: { clientes: Cliente[] }) {
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  function restaurar(c: Cliente) {
    setBusy(c.id);
    start(async () => {
      try {
        await restaurarCliente(c.id);
        toast(`"${c.nome}" restaurado.`, "success");
      } catch {
        toast("Falha ao restaurar.", "error");
      } finally {
        setBusy(null);
      }
    });
  }

  if (clientes.length === 0) {
    return (
      <EmptyState
        icon={Trash2}
        title="Lixeira vazia"
        description="Clientes removidos aparecem aqui e podem ser restaurados."
      />
    );
  }

  return (
    <Card className="divide-y">
      {clientes.map((c) => (
        <div key={c.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{c.nome}</p>
            <p className="text-xs text-muted">
              {c.empresa ? `${c.empresa} · ` : ""}removido em{" "}
              {formatData(c.deleted_at)}
            </p>
          </div>
          <Badge className="bg-surface-2 text-muted ring-border">
            {c.estagio}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            loading={pending && busy === c.id}
            onClick={() => restaurar(c)}
          >
            <RotateCcw className="size-4" /> Restaurar
          </Button>
        </div>
      ))}
    </Card>
  );
}
