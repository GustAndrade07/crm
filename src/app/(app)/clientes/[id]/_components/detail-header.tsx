"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ClienteForm } from "../../_components/cliente-form";
import { removerCliente } from "../../actions";
import type { Cliente, Profile } from "@/lib/database.types";

export function DetailHeaderActions({
  cliente,
  owners,
}: {
  cliente: Cliente;
  owners: Pick<Profile, "id" | "nome">[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmDelete() {
    setLoading(true);
    try {
      await removerCliente(cliente.id);
      toast("Cliente removido.", "success");
      router.push("/clientes");
    } catch {
      toast("Falha ao remover.", "error");
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setEdit(true)}>
        <Pencil className="size-4" /> Editar
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setDel(true)} aria-label="Remover">
        <Trash2 className="size-4 text-danger" />
      </Button>

      <ClienteForm
        key={cliente.id}
        open={edit}
        onClose={() => setEdit(false)}
        cliente={cliente}
        owners={owners}
      />
      <ConfirmDialog
        open={del}
        onClose={() => setDel(false)}
        onConfirm={confirmDelete}
        loading={loading}
        danger
        title="Remover cliente?"
        description={`"${cliente.nome}" irá para a lixeira.`}
        confirmLabel="Remover"
      />
    </>
  );
}
