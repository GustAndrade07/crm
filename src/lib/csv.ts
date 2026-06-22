import type { Cliente } from "@/lib/database.types";
import { ESTAGIO_LABEL, isEstagio } from "@/lib/constants";

/** Gera e baixa um CSV dos clientes (UTF-8 com BOM para o Excel). */
export function exportarCsv(clientes: Cliente[]) {
  const header = ["Nome", "E-mail", "Telefone", "Empresa", "Estágio", "Tags", "Criado em"];
  const linhas = clientes.map((c) => [
    c.nome,
    c.email ?? "",
    c.telefone ?? "",
    c.empresa ?? "",
    isEstagio(c.estagio) ? ESTAGIO_LABEL[c.estagio] : c.estagio,
    (c.tags ?? []).join(" "),
    new Date(c.created_at).toLocaleDateString("pt-BR"),
  ]);

  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const csv =
    "﻿" +
    [header, ...linhas].map((l) => l.map(escape).join(";")).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Parser simples de CSV (vírgula ou ponto-e-vírgula, aspas). */
export function parseCsv(
  text: string,
): { nome: string; email?: string; telefone?: string; empresa?: string }[] {
  const linhas = text.replace(/\r/g, "").trim().split("\n");
  if (linhas.length < 2) return [];

  const sep = linhas[0].includes(";") ? ";" : ",";
  const splitLine = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = !q;
      } else if (ch === sep && !q) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const stripAccents = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const head = splitLine(linhas[0]).map((h) => stripAccents(h.toLowerCase()));
  const idx = (names: string[]) =>
    head.findIndex((h) => names.some((n) => h.includes(n)));

  const iNome = idx(["nome", "name"]);
  const iEmail = idx(["email", "e-mail"]);
  const iTel = idx(["telefone", "phone", "celular", "fone"]);
  const iEmp = idx(["empresa", "company"]);

  return linhas.slice(1).map((l) => {
    const cols = splitLine(l);
    return {
      nome: iNome >= 0 ? cols[iNome] ?? "" : cols[0] ?? "",
      email: iEmail >= 0 ? cols[iEmail] : undefined,
      telefone: iTel >= 0 ? cols[iTel] : undefined,
      empresa: iEmp >= 0 ? cols[iEmp] : undefined,
    };
  });
}
