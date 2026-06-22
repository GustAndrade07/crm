import { z } from "zod";
import { ESTAGIOS } from "@/lib/constants";

const telefoneOpcional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.replace(/\D/g, "") : ""))
  .refine((v) => v === "" || (v.length >= 10 && v.length <= 11), {
    message: "Telefone deve ter DDD + número (10 ou 11 dígitos).",
  });

export const clienteSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome (mín. 2 caracteres).")
    .max(120, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => v || "")
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "E-mail inválido.",
    }),
  telefone: telefoneOpcional,
  empresa: z.string().trim().max(120).optional().transform((v) => v || ""),
  estagio: z.enum(ESTAGIOS).default("lead"),
  owner_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).max(20).default([]),
});

export type ClienteFormValues = z.input<typeof clienteSchema>;
export type ClienteParsed = z.output<typeof clienteSchema>;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("E-mail inválido.");

export const senhaSchema = z
  .string()
  .min(8, "A senha precisa ter ao menos 8 caracteres.")
  .max(72, "Senha muito longa.");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

export const cadastroSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: emailSchema,
  password: senhaSchema,
});

export const tarefaSchema = z.object({
  titulo: z.string().trim().min(2, "Descreva a tarefa."),
  descricao: z.string().trim().max(1000).optional().transform((v) => v || ""),
  due_date: z
    .string()
    .optional()
    .transform((v) => v || null),
  responsavel_id: z.string().uuid().nullable().optional(),
});

export const atividadeSchema = z.object({
  tipo: z.enum(["nota", "ligacao", "email", "reuniao"]).default("nota"),
  conteudo: z.string().trim().min(1, "Escreva algo.").max(2000),
});
