import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";

type Acao = "create" | "update" | "delete" | "restore";

/** Registra uma entrada no audit log. Best-effort: nunca derruba a ação principal. */
export async function registrarAudit(
  supabase: SupabaseClient<Database>,
  params: {
    ator_id: string;
    entidade: string;
    entidade_id: string;
    acao: Acao;
    resumo?: string;
    diff?: Json;
  },
) {
  try {
    await supabase.from("audit_log").insert({
      ator_id: params.ator_id,
      entidade: params.entidade,
      entidade_id: params.entidade_id,
      acao: params.acao,
      resumo: params.resumo ?? null,
      diff: params.diff ?? null,
    });
  } catch {
    // não propaga
  }
}
