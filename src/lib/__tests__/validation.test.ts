import { describe, it, expect } from "vitest";
import {
  clienteSchema,
  emailSchema,
  senhaSchema,
  loginSchema,
  cadastroSchema,
  tarefaSchema,
  atividadeSchema,
} from "../validation";

// Utilitário local: extrai a primeira mensagem de erro de um resultado Zod
function firstError(result: { success: false; error: { issues: { message: string }[] } }): string {
  return result.error.issues[0]?.message ?? "";
}

// ---------------------------------------------------------------------------
// clienteSchema
// ---------------------------------------------------------------------------
describe("clienteSchema", () => {
  const base = { nome: "João Silva", estagio: "lead" as const };

  describe("caminho feliz", () => {
    it("aceita payload mínimo válido", () => {
      expect(clienteSchema.safeParse(base).success).toBe(true);
    });

    it("aceita payload completo com todos os campos opcionais", () => {
      const result = clienteSchema.safeParse({
        ...base,
        email: "joao@empresa.com",
        telefone: "(11) 91234-5678",
        empresa: "Acme Tech",
        owner_id: "00000000-0000-0000-0000-000000000001",
        tags: ["vip", "indicacao"],
      });
      expect(result.success).toBe(true);
    });

    it("normaliza telefone: remove máscara e retorna só dígitos", () => {
      const result = clienteSchema.safeParse({ ...base, telefone: "(11) 91234-5678" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.telefone).toBe("11912345678");
    });

    it("estagio padrão é 'lead' quando omitido", () => {
      const result = clienteSchema.safeParse({ nome: "Ana" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.estagio).toBe("lead");
    });

    it("tags padrão é array vazio quando omitido", () => {
      const result = clienteSchema.safeParse(base);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.tags).toEqual([]);
    });

    it("converte email opcional ausente para string vazia", () => {
      const result = clienteSchema.safeParse(base);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.email).toBe("");
    });
  });

  describe("validação do campo nome", () => {
    it("rejeita nome com menos de 2 caracteres", () => {
      const result = clienteSchema.safeParse({ ...base, nome: "A" });
      expect(result.success).toBe(false);
      if (!result.success) expect(firstError(result)).toMatch(/mín\. 2/i);
    });

    it("rejeita nome vazio", () => {
      const result = clienteSchema.safeParse({ ...base, nome: "" });
      expect(result.success).toBe(false);
    });

    it("rejeita nome com mais de 120 caracteres", () => {
      const result = clienteSchema.safeParse({ ...base, nome: "A".repeat(121) });
      expect(result.success).toBe(false);
      if (!result.success) expect(firstError(result)).toMatch(/longo/i);
    });

    it("aceita nome com exatamente 2 caracteres", () => {
      expect(clienteSchema.safeParse({ ...base, nome: "Jo" }).success).toBe(true);
    });

    it("aceita nome com exatamente 120 caracteres", () => {
      expect(clienteSchema.safeParse({ ...base, nome: "A".repeat(120) }).success).toBe(true);
    });
  });

  describe("validação do campo email", () => {
    it("rejeita e-mail inválido", () => {
      const result = clienteSchema.safeParse({ ...base, email: "nao-é-email" });
      expect(result.success).toBe(false);
      if (!result.success) expect(firstError(result)).toMatch(/inválido/i);
    });

    it("aceita campo email ausente (opcional)", () => {
      expect(clienteSchema.safeParse(base).success).toBe(true);
    });

    it("aceita email vazio (tratado como não informado)", () => {
      expect(clienteSchema.safeParse({ ...base, email: "" }).success).toBe(true);
    });
  });

  describe("validação do campo telefone", () => {
    it("rejeita telefone com menos de 10 dígitos", () => {
      const result = clienteSchema.safeParse({ ...base, telefone: "11912" });
      expect(result.success).toBe(false);
      if (!result.success) expect(firstError(result)).toMatch(/10 ou 11/i);
    });

    it("rejeita telefone com mais de 11 dígitos", () => {
      const result = clienteSchema.safeParse({ ...base, telefone: "119123456789" });
      expect(result.success).toBe(false);
    });

    it("aceita telefone com 10 dígitos (fixo)", () => {
      expect(clienteSchema.safeParse({ ...base, telefone: "1132345678" }).success).toBe(true);
    });

    it("aceita telefone com 11 dígitos (celular)", () => {
      expect(clienteSchema.safeParse({ ...base, telefone: "11912345678" }).success).toBe(true);
    });

    it("aceita telefone ausente (opcional)", () => {
      expect(clienteSchema.safeParse(base).success).toBe(true);
    });
  });

  describe("validação do campo estagio", () => {
    it("rejeita estágio desconhecido", () => {
      const result = clienteSchema.safeParse({ ...base, estagio: "fantasma" });
      expect(result.success).toBe(false);
    });

    it("aceita todos os estágios válidos", () => {
      for (const estagio of ["lead", "qualificado", "ativo", "inativo"] as const) {
        expect(clienteSchema.safeParse({ ...base, estagio }).success).toBe(true);
      }
    });
  });

  describe("validação do campo tags", () => {
    it("rejeita tag que é string vazia", () => {
      const result = clienteSchema.safeParse({ ...base, tags: ["ok", ""] });
      expect(result.success).toBe(false);
    });

    it("rejeita mais de 20 tags", () => {
      const result = clienteSchema.safeParse({ ...base, tags: Array(21).fill("tag") });
      expect(result.success).toBe(false);
    });

    it("aceita exatamente 20 tags", () => {
      expect(clienteSchema.safeParse({ ...base, tags: Array(20).fill("tag") }).success).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// emailSchema
// ---------------------------------------------------------------------------
describe("emailSchema", () => {
  it("aceita e-mail válido", () => {
    expect(emailSchema.safeParse("colaborador@exemplo.com").success).toBe(true);
  });

  it("aceita qualquer domínio válido", () => {
    expect(emailSchema.safeParse("joao@gmail.com").success).toBe(true);
  });

  it("normaliza para minúsculas", () => {
    const result = emailSchema.safeParse("Colaborador@Exemplo.com");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("colaborador@exemplo.com");
  });

  it("rejeita string que não é e-mail", () => {
    const result = emailSchema.safeParse("nao-é-email");
    expect(result.success).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(emailSchema.safeParse("").success).toBe(false);
  });

  it("ignora espaços nas bordas (trim)", () => {
    expect(emailSchema.safeParse("  colaborador@exemplo.com  ").success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// senhaSchema
// ---------------------------------------------------------------------------
describe("senhaSchema", () => {
  it("aceita senha de 8 caracteres (mínimo)", () => {
    expect(senhaSchema.safeParse("12345678").success).toBe(true);
  });

  it("aceita senha de 72 caracteres (máximo)", () => {
    expect(senhaSchema.safeParse("A".repeat(72)).success).toBe(true);
  });

  it("rejeita senha com menos de 8 caracteres", () => {
    const result = senhaSchema.safeParse("1234567");
    expect(result.success).toBe(false);
    if (!result.success) expect(firstError(result)).toMatch(/8 caracteres/i);
  });

  it("rejeita senha com mais de 72 caracteres", () => {
    const result = senhaSchema.safeParse("A".repeat(73));
    expect(result.success).toBe(false);
    if (!result.success) expect(firstError(result)).toMatch(/longa/i);
  });

  it("rejeita senha vazia", () => {
    expect(senhaSchema.safeParse("").success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe("loginSchema", () => {
  const base = { email: "user@example.com", password: "qualquer" };

  it("aceita credenciais válidas", () => {
    expect(loginSchema.safeParse(base).success).toBe(true);
  });

  it("normaliza email para minúsculas", () => {
    const result = loginSchema.safeParse({ ...base, email: "User@Example.COM" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("user@example.com");
  });

  it("rejeita email inválido", () => {
    expect(loginSchema.safeParse({ ...base, email: "nao-email" }).success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const result = loginSchema.safeParse({ ...base, password: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstError(result)).toMatch(/informe a senha/i);
  });
});

// ---------------------------------------------------------------------------
// cadastroSchema
// ---------------------------------------------------------------------------
describe("cadastroSchema", () => {
  const base = {
    nome: "Colaborador Teste",
    email: "colaborador@exemplo.com",
    password: "senha1234",
  };

  it("aceita cadastro válido completo", () => {
    expect(cadastroSchema.safeParse(base).success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const result = cadastroSchema.safeParse({ ...base, email: "nao-email" });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstError(result)).toMatch(/inválido/i);
  });

  it("rejeita nome muito curto", () => {
    const result = cadastroSchema.safeParse({ ...base, nome: "A" });
    expect(result.success).toBe(false);
  });

  it("rejeita senha fraca (< 8 chars)", () => {
    const result = cadastroSchema.safeParse({ ...base, password: "curta" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// tarefaSchema
// ---------------------------------------------------------------------------
describe("tarefaSchema", () => {
  const base = { titulo: "Ligar para o cliente" };

  it("aceita payload mínimo válido", () => {
    expect(tarefaSchema.safeParse(base).success).toBe(true);
  });

  it("aceita payload completo", () => {
    const result = tarefaSchema.safeParse({
      ...base,
      descricao: "Conferir proposta enviada",
      due_date: "2025-07-01",
      responsavel_id: "00000000-0000-0000-0000-000000000002",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita título muito curto (< 2 chars)", () => {
    const result = tarefaSchema.safeParse({ titulo: "A" });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstError(result)).toMatch(/descreva a tarefa/i);
  });

  it("rejeita título vazio", () => {
    expect(tarefaSchema.safeParse({ titulo: "" }).success).toBe(false);
  });

  it("rejeita descrição com mais de 1000 caracteres", () => {
    const result = tarefaSchema.safeParse({ ...base, descricao: "A".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("converte descricao ausente para string vazia", () => {
    const result = tarefaSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.descricao).toBe("");
  });

  it("converte due_date ausente para null", () => {
    const result = tarefaSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.due_date).toBeNull();
  });

  it("rejeita responsavel_id que não é UUID válido", () => {
    const result = tarefaSchema.safeParse({ ...base, responsavel_id: "nao-uuid" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// atividadeSchema
// ---------------------------------------------------------------------------
describe("atividadeSchema", () => {
  const base = { tipo: "nota" as const, conteudo: "Cliente interessado." };

  it("aceita payload válido", () => {
    expect(atividadeSchema.safeParse(base).success).toBe(true);
  });

  it("tipo padrão é 'nota' quando omitido", () => {
    const result = atividadeSchema.safeParse({ conteudo: "Texto qualquer" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tipo).toBe("nota");
  });

  it("aceita todos os tipos válidos", () => {
    for (const tipo of ["nota", "ligacao", "email", "reuniao"] as const) {
      expect(atividadeSchema.safeParse({ tipo, conteudo: "texto" }).success).toBe(true);
    }
  });

  it("rejeita tipo desconhecido", () => {
    const result = atividadeSchema.safeParse({ tipo: "whatsapp", conteudo: "texto" });
    expect(result.success).toBe(false);
  });

  it("rejeita conteúdo vazio", () => {
    const result = atividadeSchema.safeParse({ ...base, conteudo: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstError(result)).toMatch(/escreva algo/i);
  });

  it("rejeita conteúdo com mais de 2000 caracteres", () => {
    const result = atividadeSchema.safeParse({ ...base, conteudo: "A".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("aceita conteúdo com exatamente 2000 caracteres (limite)", () => {
    expect(atividadeSchema.safeParse({ ...base, conteudo: "A".repeat(2000) }).success).toBe(true);
  });
});
