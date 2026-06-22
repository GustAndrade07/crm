"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ESTAGIO_LABEL, type Estagio } from "@/lib/constants";

const ESTAGIO_HEX: Record<Estagio, string> = {
  lead: "#0ea5e9",
  qualificado: "#f59e0b",
  ativo: "#10b981",
  inativo: "#a1a1aa",
};

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--foreground)",
  fontSize: 12,
};

export function CadastrosChart({
  data,
}: {
  data: { mes: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="mes"
          stroke="var(--muted)"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          stroke="var(--muted)"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: "var(--border)" }}
          formatter={(v) => [`${v}`, "Novos"]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#grad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function EstagioChart({
  data,
}: {
  data: { estagio: Estagio; total: number }[];
}) {
  const chartData = data.map((d) => ({
    nome: ESTAGIO_LABEL[d.estagio],
    total: d.total,
    cor: ESTAGIO_HEX[d.estagio],
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="nome"
          stroke="var(--muted)"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          stroke="var(--muted)"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--surface-2)" }}
          formatter={(v) => [`${v}`, "Clientes"]}
        />
        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
