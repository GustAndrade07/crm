"use client";

import { useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { parseCsv } from "@/lib/csv";
import { importarClientes } from "../actions";

type Row = { nome: string; email?: string; telefone?: string; empresa?: string };

export function ImportarModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  function reset() {
    setRows([]);
    setFileName("");
  }

  async function onFile(file: File) {
    const text = await file.text();
    const parsed = parseCsv(text).filter((r) => r.nome?.trim().length >= 2);
    setRows(parsed);
    setFileName(file.name);
  }

  async function confirmar() {
    setLoading(true);
    try {
      const res = await importarClientes(rows);
      toast(
        `${res.inseridos} importado(s)${res.ignorados ? `, ${res.ignorados} ignorado(s)` : ""}.`,
        "success",
      );
      reset();
      onClose();
    } catch {
      toast("Falha ao importar.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Importar clientes (CSV)"
      description="Colunas reconhecidas: nome, email, telefone, empresa."
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      {rows.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-muted transition-colors hover:border-primary hover:text-primary"
        >
          <FileUp className="size-7" />
          <span className="text-sm font-medium">Escolher arquivo CSV</span>
          <span className="text-xs">Separador vírgula ou ponto-e-vírgula</span>
        </button>
      ) : (
        <div>
          <p className="mb-2 text-sm text-muted">
            <span className="font-medium text-foreground">{fileName}</span> —{" "}
            {rows.length} cliente(s) prontos para importar.
          </p>
          <div className="max-h-60 overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-2 text-left text-xs text-muted">
                <tr>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">E-mail</th>
                  <th className="px-3 py-2">Empresa</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-1.5">{r.nome}</td>
                    <td className="px-3 py-1.5 text-muted">{r.email ?? "—"}</td>
                    <td className="px-3 py-1.5 text-muted">{r.empresa ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={reset} disabled={loading}>
              Trocar arquivo
            </Button>
            <Button onClick={confirmar} loading={loading}>
              Importar {rows.length}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
