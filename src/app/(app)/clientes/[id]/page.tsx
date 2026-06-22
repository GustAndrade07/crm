import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building2, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Avatar, Badge } from "@/components/ui/primitives";
import { EstagioBadge } from "@/components/estagio-badge";
import { maskTelefone, formatData, iniciais } from "@/lib/format";
import { Timeline } from "./_components/timeline";
import { TarefasCliente } from "./_components/tarefas-cliente";
import { DetailHeaderActions } from "./_components/detail-header";
import type { Cliente } from "@/lib/database.types";

type Params = Promise<{ id: string }>;

export default async function ClienteDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!cliente) notFound();
  const c = cliente as Cliente;

  const [
    { data: atividades },
    { data: tarefas },
    { data: owners },
    ownerProfile,
  ] = await Promise.all([
    supabase
      .from("atividades")
      .select("id, tipo, conteudo, created_at, autor_id, profiles(nome)")
      .eq("cliente_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tarefas")
      .select("id, titulo, due_date, concluida, responsavel_id")
      .eq("cliente_id", id)
      .order("concluida")
      .order("due_date", { nullsFirst: false }),
    supabase.from("profiles").select("id, nome").order("nome"),
    c.owner_id
      ? supabase.from("profiles").select("nome").eq("id", c.owner_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const atividadesView = (atividades ?? []).map((a) => {
    const prof = a.profiles as { nome: string | null } | null;
    return {
      id: a.id,
      tipo: a.tipo,
      conteudo: a.conteudo,
      created_at: a.created_at,
      autor_id: a.autor_id,
      autor_nome: prof?.nome ?? null,
    };
  });

  const ownerNome = (ownerProfile?.data as { nome: string | null } | null)?.nome ?? null;

  return (
    <div>
      <Link
        href="/clientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Clientes
      </Link>

      {/* Cabeçalho */}
      <Card className="mb-6 p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
            {iniciais(c.nome)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{c.nome}</h1>
              <EstagioBadge estagio={c.estagio} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              {c.empresa && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4" /> {c.empresa}
                </span>
              )}
              {c.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-primary"
                >
                  <Mail className="size-4" /> {c.email}
                </a>
              )}
              {c.telefone && (
                <a
                  href={`tel:${c.telefone}`}
                  className="inline-flex items-center gap-1.5 hover:text-primary"
                >
                  <Phone className="size-4" /> {maskTelefone(c.telefone)}
                </a>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" /> Desde {formatData(c.created_at)}
              </span>
            </div>
            {c.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <Badge key={t} className="bg-surface-2 text-muted ring-border">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {c.owner_id && (
              <div className="mr-1 hidden items-center gap-2 sm:flex">
                <Avatar nome={ownerNome} className="size-7" />
                <span className="text-sm text-muted">{ownerNome ?? "Equipe"}</span>
              </div>
            )}
            <DetailHeaderActions cliente={c} owners={owners ?? []} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Timeline clienteId={id} atividades={atividadesView} />
        <TarefasCliente clienteId={id} tarefas={tarefas ?? []} owners={owners ?? []} />
      </div>
    </div>
  );
}
