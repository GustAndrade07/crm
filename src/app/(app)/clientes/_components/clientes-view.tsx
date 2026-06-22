"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Upload,
  Download,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Card, EmptyState, Avatar, Badge, PageHeader } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { EstagioBadge } from "@/components/estagio-badge";
import { ClienteForm } from "./cliente-form";
import { ImportarModal } from "./importar-modal";
import { exportarCsv } from "@/lib/csv";
import { formatData, maskTelefone } from "@/lib/format";
import { ESTAGIOS, ESTAGIO_LABEL, PAGE_SIZE } from "@/lib/constants";
import { removerCliente, bulkEstagio, bulkRemover } from "../actions";
import type { Cliente, Profile } from "@/lib/database.types";

type Owner = Pick<Profile, "id" | "nome">;

export type ClientesParams = {
  q: string;
  estagio: string;
  owner: string;
  sort: string;
  page: number;
};

export function ClientesView({
  clientes,
  total,
  owners,
  params,
}: {
  clientes: Cliente[];
  total: number;
  owners: Owner[];
  params: ClientesParams;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Cliente | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const ownerNome = (id: string | null) =>
    id ? owners.find((o) => o.id === id)?.nome ?? "Equipe" : null;

  function setParam(patch: Partial<ClientesParams>) {
    const next = { ...params, ...patch };
    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.estagio) sp.set("estagio", next.estagio);
    if (next.owner) sp.set("owner", next.owner);
    if (next.sort && next.sort !== "recentes") sp.set("sort", next.sort);
    if (next.page > 1) sp.set("page", String(next.page));
    startTransition(() => router.replace(`/clientes?${sp.toString()}`));
  }

  function onSearch(value: string) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(
      () => setParam({ q: value, page: 1 }),
      300,
    );
  }

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const allChecked = clientes.length > 0 && clientes.every((c) => selected.has(c.id));
  function toggleAll() {
    setSelected((s) => {
      if (clientes.every((c) => s.has(c.id))) {
        const n = new Set(s);
        clientes.forEach((c) => n.delete(c.id));
        return n;
      }
      return new Set([...s, ...clientes.map((c) => c.id)]);
    });
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      if (bulkDelete) {
        await bulkRemover([...selected]);
        toast(`${selected.size} cliente(s) movido(s) para a lixeira.`, "success");
        setSelected(new Set());
        setBulkDelete(false);
      } else if (toDelete) {
        await removerCliente(toDelete.id);
        toast("Cliente removido.", "success");
        setToDelete(null);
      }
    } catch {
      toast("Falha ao remover.", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function aplicarEstagio(estagio: string) {
    const ids = [...selected];
    await bulkEstagio(ids, estagio);
    toast(`${ids.length} cliente(s) movido(s) para ${ESTAGIO_LABEL[estagio as keyof typeof ESTAGIO_LABEL]}.`, "success");
    setSelected(new Set());
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${total} cliente${total === 1 ? "" : "s"} na base`}
      >
        <Link href="/clientes/lixeira">
          <Button variant="ghost" size="sm">
            <Trash2 className="size-4" /> Lixeira
          </Button>
        </Link>
        <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="size-4" /> Importar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => exportarCsv(clientes)}
          disabled={clientes.length === 0}
        >
          <Download className="size-4" /> Exportar
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> Novo cliente
        </Button>
      </PageHeader>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            defaultValue={params.q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou empresa…"
            className="pl-9"
            aria-label="Buscar clientes"
          />
        </div>
        <Select
          value={params.estagio}
          onChange={(e) => setParam({ estagio: e.target.value, page: 1 })}
          className="w-auto"
          aria-label="Filtrar por estágio"
        >
          <option value="">Todos os estágios</option>
          {ESTAGIOS.map((e) => (
            <option key={e} value={e}>
              {ESTAGIO_LABEL[e]}
            </option>
          ))}
        </Select>
        <Select
          value={params.owner}
          onChange={(e) => setParam({ owner: e.target.value, page: 1 })}
          className="w-auto"
          aria-label="Filtrar por responsável"
        >
          <option value="">Todos responsáveis</option>
          <option value="none">Sem responsável</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome ?? "Equipe"}
            </option>
          ))}
        </Select>
        <Select
          value={params.sort}
          onChange={(e) => setParam({ sort: e.target.value, page: 1 })}
          className="w-auto"
          aria-label="Ordenar"
        >
          <option value="recentes">Mais recentes</option>
          <option value="antigos">Mais antigos</option>
          <option value="nome">Nome (A–Z)</option>
          <option value="empresa">Empresa (A–Z)</option>
        </Select>
      </div>

      {/* Barra de seleção */}
      {selected.size > 0 && (
        <div className="animate-fade-in mb-3 flex flex-wrap items-center gap-2 rounded-lg border bg-surface px-3 py-2 text-sm">
          <span className="font-medium">{selected.size} selecionado(s)</span>
          <div className="ml-auto flex items-center gap-2">
            <Select
              defaultValue=""
              onChange={(e) => e.target.value && aplicarEstagio(e.target.value)}
              className="h-8 w-auto py-0 text-xs"
              aria-label="Mudar estágio em massa"
            >
              <option value="">Mudar estágio…</option>
              {ESTAGIOS.map((e) => (
                <option key={e} value={e}>
                  {ESTAGIO_LABEL[e]}
                </option>
              ))}
            </Select>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setBulkDelete(true)}
            >
              <Trash2 className="size-4" /> Remover
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelected(new Set())}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Lista */}
      {clientes.length === 0 ? (
        <EmptyState
          icon={Users}
          title={params.q || params.estagio || params.owner ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          description={
            params.q || params.estagio || params.owner
              ? "Ajuste os filtros ou a busca."
              : "Cadastre o primeiro cliente ou importe sua base via CSV."
          }
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="size-4" /> Novo cliente
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-surface-2/50 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      aria-label="Selecionar todos"
                      className="size-4 accent-[var(--primary)]"
                    />
                  </th>
                  <th className="px-3 py-3 font-medium">Nome</th>
                  <th className="hidden px-3 py-3 font-medium md:table-cell">Contato</th>
                  <th className="hidden px-3 py-3 font-medium lg:table-cell">Empresa</th>
                  <th className="px-3 py-3 font-medium">Estágio</th>
                  <th className="hidden px-3 py-3 font-medium sm:table-cell">Resp.</th>
                  <th className="hidden px-3 py-3 font-medium xl:table-cell">Criado</th>
                  <th className="w-20 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr
                    key={c.id}
                    className="group border-b last:border-0 hover:bg-surface-2/40"
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        aria-label={`Selecionar ${c.nome}`}
                        className="size-4 accent-[var(--primary)]"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/clientes/${c.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {c.nome}
                      </Link>
                      {c.tags?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.tags.slice(0, 3).map((t) => (
                            <Badge
                              key={t}
                              className="bg-surface-2 text-muted ring-border"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="hidden px-3 py-3 text-muted md:table-cell">
                      <div className="flex flex-col">
                        {c.email && <span className="truncate">{c.email}</span>}
                        {c.telefone && (
                          <span className="text-xs">{maskTelefone(c.telefone)}</span>
                        )}
                        {!c.email && !c.telefone && "—"}
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 text-muted lg:table-cell">
                      {c.empresa ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <EstagioBadge estagio={c.estagio} />
                    </td>
                    <td className="hidden px-3 py-3 sm:table-cell">
                      {c.owner_id ? (
                        <Avatar nome={ownerNome(c.owner_id)} className="size-7" />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="hidden px-3 py-3 text-muted xl:table-cell">
                      {formatData(c.created_at)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditing(c);
                            setFormOpen(true);
                          }}
                          aria-label="Editar"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToDelete(c)}
                          aria-label="Remover"
                        >
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>
            Página {params.page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={params.page <= 1}
              onClick={() => setParam({ page: params.page - 1 })}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={params.page >= totalPages}
              onClick={() => setParam({ page: params.page + 1 })}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <ClienteForm
        key={editing?.id ?? "novo"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        cliente={editing}
        owners={owners}
      />
      <ImportarModal open={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmDialog
        open={!!toDelete || bulkDelete}
        onClose={() => {
          setToDelete(null);
          setBulkDelete(false);
        }}
        onConfirm={confirmDelete}
        loading={deleting}
        danger
        title={bulkDelete ? "Remover selecionados?" : "Remover cliente?"}
        description={
          bulkDelete
            ? `${selected.size} cliente(s) irão para a lixeira. Você pode restaurar depois.`
            : `"${toDelete?.nome}" irá para a lixeira. Você pode restaurar depois.`
        }
        confirmLabel="Remover"
      />
    </div>
  );
}
