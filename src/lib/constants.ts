/** Estágios do funil de clientes — fonte única de verdade no app. */
export const ESTAGIOS = ["lead", "qualificado", "ativo", "inativo"] as const;
export type Estagio = (typeof ESTAGIOS)[number];

export const ESTAGIO_LABEL: Record<Estagio, string> = {
  lead: "Lead",
  qualificado: "Qualificado",
  ativo: "Ativo",
  inativo: "Inativo",
};

/** Classes de cor por estágio, usadas em badges e colunas. */
export const ESTAGIO_STYLE: Record<
  Estagio,
  { dot: string; badge: string; bar: string }
> = {
  lead: {
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
    bar: "bg-sky-500",
  },
  qualificado: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    bar: "bg-amber-500",
  },
  ativo: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    bar: "bg-emerald-500",
  },
  inativo: {
    dot: "bg-zinc-400",
    badge:
      "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/20",
    bar: "bg-zinc-400",
  },
};

export function isEstagio(v: string): v is Estagio {
  return (ESTAGIOS as readonly string[]).includes(v);
}

/** Tipos de atividade na timeline do cliente. */
export const TIPOS_ATIVIDADE = [
  "nota",
  "ligacao",
  "email",
  "reuniao",
  "sistema",
] as const;
export type TipoAtividade = (typeof TIPOS_ATIVIDADE)[number];

export const TIPO_ATIVIDADE_LABEL: Record<TipoAtividade, string> = {
  nota: "Nota",
  ligacao: "Ligação",
  email: "E-mail",
  reuniao: "Reunião",
  sistema: "Sistema",
};

export const PAGE_SIZE = 12;
