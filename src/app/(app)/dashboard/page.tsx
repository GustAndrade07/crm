import Link from "next/link";
import {
  Users,
  UserPlus,
  TrendingUp,
  Target,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { CadastrosChart, EstagioChart } from "./_components/charts";
import { timeAgo } from "@/lib/format";
import {
  ESTAGIOS,
  ESTAGIO_LABEL,
  ESTAGIO_STYLE,
  type Estagio,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: atividade }] = await Promise.all([
    supabase
      .from("clientes")
      .select("created_at, estagio, empresa")
      .is("deleted_at", null)
      .limit(5000),
    supabase
      .from("audit_log")
      .select("id, acao, resumo, created_at, profiles(nome)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const rows = clientes ?? [];
  const total = rows.length;

  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const novosMes = rows.filter((c) => new Date(c.created_at) >= inicioMes).length;
  const novosMesAnterior = rows.filter((c) => {
    const d = new Date(c.created_at);
    return d >= inicioMesAnterior && d < inicioMes;
  }).length;
  const crescimento =
    novosMesAnterior === 0
      ? novosMes > 0
        ? 100
        : 0
      : Math.round(((novosMes - novosMesAnterior) / novosMesAnterior) * 100);

  const byEstagio = ESTAGIOS.map((e) => ({
    estagio: e as Estagio,
    total: rows.filter((c) => c.estagio === e).length,
  }));
  const ativos = byEstagio.find((b) => b.estagio === "ativo")?.total ?? 0;
  const conversao = total > 0 ? Math.round((ativos / total) * 100) : 0;

  // Série dos últimos 6 meses
  const serie: { mes: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const prox = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = rows.filter((c) => {
      const cd = new Date(c.created_at);
      return cd >= d && cd < prox;
    }).length;
    serie.push({ mes: MESES[d.getMonth()], total: count });
  }

  // Top empresas
  const empresaMap = new Map<string, number>();
  for (const c of rows) {
    const e = (c.empresa ?? "").trim();
    if (e) empresaMap.set(e, (empresaMap.get(e) ?? 0) + 1);
  }
  const topEmpresas = [...empresaMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxEmpresa = topEmpresas[0]?.[1] ?? 1;

  const kpis = [
    {
      label: "Total de clientes",
      valor: total,
      icon: Users,
      hint: `${ativos} ativos`,
    },
    {
      label: "Novos no mês",
      valor: novosMes,
      icon: UserPlus,
      trend: crescimento,
    },
    {
      label: "Taxa de conversão",
      valor: `${conversao}%`,
      icon: Target,
      hint: "ativos / total",
    },
    {
      label: "No funil",
      valor:
        (byEstagio.find((b) => b.estagio === "lead")?.total ?? 0) +
        (byEstagio.find((b) => b.estagio === "qualificado")?.total ?? 0),
      icon: TrendingUp,
      hint: "leads + qualificados",
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral da base de clientes.">
        <Link href="/clientes">
          <Button size="sm">Ver clientes</Button>
        </Link>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{k.label}</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <k.icon className="size-4" />
              </span>
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {k.valor}
              </span>
              {typeof k.trend === "number" && (
                <span
                  className={cn(
                    "mb-1 inline-flex items-center gap-0.5 text-xs font-medium",
                    k.trend >= 0 ? "text-emerald-500" : "text-danger",
                  )}
                >
                  {k.trend >= 0 ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                  {Math.abs(k.trend)}%
                </span>
              )}
            </div>
            {k.hint && <p className="mt-0.5 text-xs text-muted">{k.hint}</p>}
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Cadastros nos últimos 6 meses
          </h2>
          <div className="mt-4">
            <CadastrosChart data={serie} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground">
            Distribuição por estágio
          </h2>
          <div className="mt-4">
            <EstagioChart data={byEstagio} />
          </div>
        </Card>
      </div>

      {/* Funil + Top empresas + Atividade */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Funil</h2>
          <ul className="space-y-3">
            {byEstagio.map((b) => {
              const pct = total > 0 ? Math.round((b.total / total) * 100) : 0;
              return (
                <li key={b.estagio}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground">
                      {ESTAGIO_LABEL[b.estagio]}
                    </span>
                    <span className="text-muted">{b.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn("h-full rounded-full", ESTAGIO_STYLE[b.estagio].bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="size-4 text-muted" /> Top empresas
          </h2>
          {topEmpresas.length === 0 ? (
            <p className="text-sm text-muted">Sem empresas cadastradas.</p>
          ) : (
            <ul className="space-y-3">
              {topEmpresas.map(([nome, qtd]) => (
                <li key={nome}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate text-foreground">{nome}</span>
                    <span className="text-muted">{qtd}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(qtd / maxEmpresa) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Activity className="size-4 text-muted" /> Atividade recente
          </h2>
          {(atividade ?? []).length === 0 ? (
            <p className="text-sm text-muted">Nada por aqui ainda.</p>
          ) : (
            <ul className="space-y-3">
              {(atividade ?? []).map((a) => {
                const prof = a.profiles as { nome: string | null } | null;
                return (
                  <li key={a.id} className="flex gap-3">
                    <Avatar nome={prof?.nome} className="size-7 text-[10px]" />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{a.resumo}</p>
                      <p className="text-xs text-muted">
                        {prof?.nome ?? "Equipe"} · {timeAgo(a.created_at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
