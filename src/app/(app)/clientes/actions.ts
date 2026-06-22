"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { registrarAudit } from "@/lib/audit";
import { clienteSchema } from "@/lib/validation";
import { ESTAGIOS, type Estagio } from "@/lib/constants";

export type ClienteActionState = { error?: string; ok?: boolean };

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function fromForm(formData: FormData) {
  return clienteSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    empresa: formData.get("empresa"),
    estagio: formData.get("estagio") ?? "lead",
    owner_id: (formData.get("owner_id") as string) || null,
    tags: parseTags(formData.get("tags")),
  });
}

export async function criarCliente(
  _prev: ClienteActionState,
  formData: FormData,
): Promise<ClienteActionState> {
  const parsed = fromForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nome: parsed.data.nome,
      email: parsed.data.email || null,
      telefone: parsed.data.telefone || null,
      empresa: parsed.data.empresa || null,
      estagio: parsed.data.estagio,
      owner_id: parsed.data.owner_id ?? null,
      tags: parsed.data.tags,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível salvar o cliente." };

  await registrarAudit(supabase, {
    ator_id: user.id,
    entidade: "cliente",
    entidade_id: data.id,
    acao: "create",
    resumo: `Criou o cliente ${parsed.data.nome}`,
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function atualizarCliente(
  _prev: ClienteActionState,
  formData: FormData,
): Promise<ClienteActionState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Cliente inválido." };

  const parsed = fromForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("clientes")
    .update({
      nome: parsed.data.nome,
      email: parsed.data.email || null,
      telefone: parsed.data.telefone || null,
      empresa: parsed.data.empresa || null,
      estagio: parsed.data.estagio,
      owner_id: parsed.data.owner_id ?? null,
      tags: parsed.data.tags,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar o cliente." };

  await registrarAudit(supabase, {
    ator_id: user.id,
    entidade: "cliente",
    entidade_id: id,
    acao: "update",
    resumo: `Editou o cliente ${parsed.data.nome}`,
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function removerCliente(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("clientes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error("Falha ao remover.");

  await registrarAudit(supabase, {
    ator_id: user.id,
    entidade: "cliente",
    entidade_id: id,
    acao: "delete",
    resumo: "Removeu o cliente (lixeira)",
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

export async function restaurarCliente(id: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("clientes").update({ deleted_at: null }).eq("id", id);
  await registrarAudit(supabase, {
    ator_id: user.id,
    entidade: "cliente",
    entidade_id: id,
    acao: "restore",
    resumo: "Restaurou o cliente",
  });
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

export async function mudarEstagio(id: string, estagio: string) {
  if (!(ESTAGIOS as readonly string[]).includes(estagio)) {
    throw new Error("Estágio inválido.");
  }
  const { supabase, user } = await requireUser();
  await supabase
    .from("clientes")
    .update({ estagio: estagio as Estagio })
    .eq("id", id);
  await registrarAudit(supabase, {
    ator_id: user.id,
    entidade: "cliente",
    entidade_id: id,
    acao: "update",
    resumo: `Moveu para "${estagio}"`,
  });
  revalidatePath("/clientes");
  revalidatePath("/funil");
  revalidatePath("/dashboard");
}

export async function bulkEstagio(ids: string[], estagio: string) {
  if (!ids.length) return;
  if (!(ESTAGIOS as readonly string[]).includes(estagio)) return;
  const { supabase } = await requireUser();
  await supabase
    .from("clientes")
    .update({ estagio: estagio as Estagio })
    .in("id", ids);
  revalidatePath("/clientes");
  revalidatePath("/funil");
  revalidatePath("/dashboard");
}

export async function bulkRemover(ids: string[]) {
  if (!ids.length) return;
  const { supabase } = await requireUser();
  await supabase
    .from("clientes")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids);
  revalidatePath("/clientes");
  revalidatePath("/dashboard");
}

type ImportRow = {
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
};

export async function importarClientes(
  rows: ImportRow[],
): Promise<{ inseridos: number; ignorados: number }> {
  const { supabase, user } = await requireUser();

  const validos = rows
    .map((r) => ({
      nome: (r.nome ?? "").trim(),
      email: (r.email ?? "").trim() || null,
      telefone: (r.telefone ?? "").replace(/\D/g, "") || null,
      empresa: (r.empresa ?? "").trim() || null,
      estagio: "lead",
    }))
    .filter((r) => r.nome.length >= 2)
    .slice(0, 1000);

  if (!validos.length) return { inseridos: 0, ignorados: rows.length };

  const { error, count } = await supabase
    .from("clientes")
    .insert(validos, { count: "exact" });

  if (error) throw new Error("Falha ao importar.");

  await registrarAudit(supabase, {
    ator_id: user.id,
    entidade: "cliente",
    entidade_id: user.id,
    acao: "create",
    resumo: `Importou ${count ?? validos.length} clientes via CSV`,
  });

  revalidatePath("/clientes");
  revalidatePath("/dashboard");
  return {
    inseridos: count ?? validos.length,
    ignorados: rows.length - validos.length,
  };
}
