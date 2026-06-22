import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/primitives";
import { TarefasLista, type TarefaItem } from "./_components/tarefas-lista";

export default async function TarefasPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tarefas")
    .select(
      "id, titulo, due_date, concluida, cliente_id, clientes(nome), responsavel:profiles(nome)",
    )
    .order("concluida")
    .order("due_date", { nullsFirst: false })
    .limit(500);

  const tarefas: TarefaItem[] = (data ?? []).map((t) => {
    const cliente = t.clientes as { nome: string | null } | null;
    const resp = t.responsavel as { nome: string | null } | null;
    return {
      id: t.id,
      titulo: t.titulo,
      due_date: t.due_date,
      concluida: t.concluida,
      cliente_id: t.cliente_id,
      cliente_nome: cliente?.nome ?? null,
      responsavel_nome: resp?.nome ?? null,
    };
  });

  return (
    <div>
      <PageHeader
        title="Tarefas"
        description="Follow-ups e pendências de toda a equipe."
      />
      <TarefasLista tarefas={tarefas} />
    </div>
  );
}
