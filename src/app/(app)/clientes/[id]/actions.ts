"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { atividadeSchema, tarefaSchema } from "@/lib/validation";

export type DetailActionState = { error?: string; ok?: boolean };

export async function adicionarAtividade(
  _prev: DetailActionState,
  formData: FormData,
): Promise<DetailActionState> {
  const clienteId = formData.get("cliente_id") as string;
  const parsed = atividadeSchema.safeParse({
    tipo: formData.get("tipo") ?? "nota",
    conteudo: formData.get("conteudo"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("atividades").insert({
    cliente_id: clienteId,
    autor_id: user.id,
    tipo: parsed.data.tipo,
    conteudo: parsed.data.conteudo,
  });
  if (error) return { error: "Não foi possível registrar." };

  revalidatePath(`/clientes/${clienteId}`);
  return { ok: true };
}

export async function removerAtividade(id: string, clienteId: string) {
  const { supabase } = await requireUser();
  await supabase.from("atividades").delete().eq("id", id);
  revalidatePath(`/clientes/${clienteId}`);
}

export async function adicionarTarefa(
  _prev: DetailActionState,
  formData: FormData,
): Promise<DetailActionState> {
  const clienteId = formData.get("cliente_id") as string;
  const parsed = tarefaSchema.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    due_date: formData.get("due_date"),
    responsavel_id: (formData.get("responsavel_id") as string) || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("tarefas").insert({
    cliente_id: clienteId,
    titulo: parsed.data.titulo,
    descricao: parsed.data.descricao || null,
    due_date: parsed.data.due_date,
    responsavel_id: parsed.data.responsavel_id ?? null,
  });
  if (error) return { error: "Não foi possível criar a tarefa." };

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/tarefas");
  return { ok: true };
}

export async function toggleTarefa(
  id: string,
  concluida: boolean,
  clienteId?: string,
) {
  const { supabase } = await requireUser();
  await supabase.from("tarefas").update({ concluida }).eq("id", id);
  if (clienteId) revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/tarefas");
}

export async function removerTarefa(id: string, clienteId?: string) {
  const { supabase } = await requireUser();
  await supabase.from("tarefas").delete().eq("id", id);
  if (clienteId) revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/tarefas");
}
