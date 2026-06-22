import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/primitives";
import { LixeiraView } from "./_components/lixeira-view";
import type { Cliente } from "@/lib/database.types";

export default async function LixeiraPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <Link
        href="/clientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Clientes
      </Link>
      <PageHeader
        title="Lixeira"
        description="Clientes removidos. Restaure quando precisar."
      />
      <LixeiraView clientes={(data as Cliente[]) ?? []} />
    </div>
  );
}
