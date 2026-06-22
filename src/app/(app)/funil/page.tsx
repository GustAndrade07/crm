import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/primitives";
import { KanbanBoard } from "./_components/kanban-board";
import type { Cliente } from "@/lib/database.types";

export default async function FunilPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: owners }] = await Promise.all([
    supabase
      .from("clientes")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(500),
    supabase.from("profiles").select("id, nome").order("nome"),
  ]);

  return (
    <div>
      <PageHeader
        title="Funil"
        description="Arraste os cards para mover clientes entre estágios."
      />
      <KanbanBoard
        inicial={(clientes as Cliente[]) ?? []}
        owners={owners ?? []}
      />
    </div>
  );
}
