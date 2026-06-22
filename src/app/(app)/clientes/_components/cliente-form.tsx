"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { maskTelefone } from "@/lib/format";
import { ESTAGIOS, ESTAGIO_LABEL } from "@/lib/constants";
import {
  criarCliente,
  atualizarCliente,
  type ClienteActionState,
} from "../actions";
import type { Cliente, Profile } from "@/lib/database.types";

export function ClienteForm({
  open,
  onClose,
  cliente,
  owners,
}: {
  open: boolean;
  onClose: () => void;
  cliente?: Cliente | null;
  owners: Pick<Profile, "id" | "nome">[];
}) {
  const editing = !!cliente;
  const action = editing ? atualizarCliente : criarCliente;
  const [state, formAction, pending] = useActionState<
    ClienteActionState,
    FormData
  >(action, {});
  const [telefone, setTelefone] = useState(() =>
    cliente?.telefone ? maskTelefone(cliente.telefone) : "",
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.ok) {
      toast(editing ? "Cliente atualizado." : "Cliente criado.", "success");
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar cliente" : "Novo cliente"}
      description={
        editing ? undefined : "Cadastre um novo cliente na base da equipe."
      }
      size="lg"
    >
      <form action={formAction} className="space-y-4">
        {editing && <input type="hidden" name="id" value={cliente!.id} />}

        {state.error && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertCircle className="size-4 shrink-0" />
            {state.error}
          </div>
        )}

        <Field label="Nome *" htmlFor="nome">
          <Input
            id="nome"
            name="nome"
            defaultValue={cliente?.nome ?? ""}
            placeholder="Nome do cliente"
            required
            autoFocus
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={cliente?.email ?? ""}
              placeholder="contato@empresa.com"
            />
          </Field>
          <Field label="Telefone" htmlFor="telefone">
            <Input
              id="telefone"
              name="telefone"
              inputMode="tel"
              value={telefone}
              onChange={(e) => setTelefone(maskTelefone(e.target.value))}
              placeholder="(11) 91234-5678"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Empresa" htmlFor="empresa">
            <Input
              id="empresa"
              name="empresa"
              defaultValue={cliente?.empresa ?? ""}
              placeholder="Empresa"
            />
          </Field>
          <Field label="Estágio" htmlFor="estagio">
            <Select
              id="estagio"
              name="estagio"
              defaultValue={cliente?.estagio ?? "lead"}
            >
              {ESTAGIOS.map((e) => (
                <option key={e} value={e}>
                  {ESTAGIO_LABEL[e]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Responsável" htmlFor="owner_id">
            <Select
              id="owner_id"
              name="owner_id"
              defaultValue={cliente?.owner_id ?? ""}
            >
              <option value="">— Sem responsável —</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome ?? "Equipe"}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Tags"
            htmlFor="tags"
            hint="Separe por vírgula (ex.: vip, indicação)"
          >
            <Input
              id="tags"
              name="tags"
              defaultValue={cliente?.tags?.join(", ") ?? ""}
              placeholder="vip, indicação"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={pending}>
            {editing ? "Salvar" : "Criar cliente"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
