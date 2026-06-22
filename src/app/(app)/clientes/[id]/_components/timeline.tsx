"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  StickyNote,
  Phone,
  Mail,
  Users2,
  Cog,
  Trash2,
  Send,
} from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Textarea, Select } from "@/components/ui/field";
import { timeAgo } from "@/lib/format";
import { TIPO_ATIVIDADE_LABEL, type TipoAtividade } from "@/lib/constants";
import {
  adicionarAtividade,
  removerAtividade,
  type DetailActionState,
} from "../actions";

type AtividadeView = {
  id: string;
  tipo: string;
  conteudo: string;
  created_at: string;
  autor_id: string | null;
  autor_nome: string | null;
};

const ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  nota: StickyNote,
  ligacao: Phone,
  email: Mail,
  reuniao: Users2,
  sistema: Cog,
};

export function Timeline({
  clienteId,
  atividades,
}: {
  clienteId: string;
  atividades: AtividadeView[];
}) {
  const [state, action, pending] = useActionState<DetailActionState, FormData>(
    adicionarAtividade,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-foreground">Atividades</h2>

      <form ref={formRef} action={action} className="mt-4">
        <input type="hidden" name="cliente_id" value={clienteId} />
        <Textarea
          name="conteudo"
          placeholder="Registre uma nota, ligação, e-mail ou reunião…"
          required
          rows={2}
        />
        {state.error && (
          <p className="mt-1 text-xs text-danger">{state.error}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <Select name="tipo" defaultValue="nota" className="h-9 w-auto py-0 text-sm">
            {(["nota", "ligacao", "email", "reuniao"] as TipoAtividade[]).map(
              (t) => (
                <option key={t} value={t}>
                  {TIPO_ATIVIDADE_LABEL[t]}
                </option>
              ),
            )}
          </Select>
          <Button type="submit" size="sm" loading={pending} className="ml-auto">
            <Send className="size-4" /> Registrar
          </Button>
        </div>
      </form>

      <ol className="mt-6 space-y-4">
        {atividades.length === 0 && (
          <li className="text-sm text-muted">Nenhuma atividade ainda.</li>
        )}
        {atividades.map((a) => {
          const Icon = ICON[a.tipo] ?? StickyNote;
          return (
            <li key={a.id} className="group flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="font-medium text-foreground">
                    {a.autor_nome ?? "Equipe"}
                  </span>
                  <span>· {TIPO_ATIVIDADE_LABEL[a.tipo as TipoAtividade] ?? a.tipo}</span>
                  <span>· {timeAgo(a.created_at)}</span>
                  <button
                    onClick={() => removerAtividade(a.id, clienteId)}
                    className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remover atividade"
                  >
                    <Trash2 className="size-3.5 text-muted hover:text-danger" />
                  </button>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {a.conteudo}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
