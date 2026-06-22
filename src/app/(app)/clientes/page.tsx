import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE, isEstagio } from "@/lib/constants";
import { ClientesView, type ClientesParams } from "./_components/clientes-view";
import type { Cliente } from "@/lib/database.types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const params: ClientesParams = {
    q: str(sp.q),
    estagio: isEstagio(str(sp.estagio)) ? str(sp.estagio) : "",
    owner: str(sp.owner),
    sort: str(sp.sort) || "recentes",
    page: Math.max(1, parseInt(str(sp.page) || "1", 10) || 1),
  };

  const supabase = await createClient();

  let query = supabase
    .from("clientes")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  if (params.q) {
    // Sanitiza para o filtro or() do PostgREST
    const safe = params.q.replace(/[%,()]/g, " ").trim();
    if (safe) {
      query = query.or(
        `nome.ilike.%${safe}%,email.ilike.%${safe}%,empresa.ilike.%${safe}%`,
      );
    }
  }
  if (params.estagio) query = query.eq("estagio", params.estagio);
  if (params.owner === "none") query = query.is("owner_id", null);
  else if (params.owner) query = query.eq("owner_id", params.owner);

  switch (params.sort) {
    case "antigos":
      query = query.order("created_at", { ascending: true });
      break;
    case "nome":
      query = query.order("nome", { ascending: true });
      break;
    case "empresa":
      query = query.order("empresa", { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (params.page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const [{ data: clientes, count }, { data: owners }] = await Promise.all([
    query,
    supabase.from("profiles").select("id, nome").order("nome"),
  ]);

  return (
    <ClientesView
      clientes={(clientes as Cliente[]) ?? []}
      total={count ?? 0}
      owners={owners ?? []}
      params={params}
    />
  );
}
