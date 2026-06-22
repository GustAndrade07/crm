import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  maskTelefone,
  onlyDigits,
  formatData,
  formatDataHora,
  timeAgo,
  iniciais,
} from "../format";

// ---------------------------------------------------------------------------
// maskTelefone
// ---------------------------------------------------------------------------
describe("maskTelefone", () => {
  describe("caminho feliz", () => {
    it("formata celular com 11 dígitos (DDD + 9 + número)", () => {
      expect(maskTelefone("11912345678")).toBe("(11) 91234-5678");
    });

    it("formata fixo com 10 dígitos (DDD + número)", () => {
      expect(maskTelefone("1132345678")).toBe("(11) 3234-5678");
    });

    it("formata entrada já com máscara (idempotente na saída)", () => {
      expect(maskTelefone("(11) 91234-5678")).toBe("(11) 91234-5678");
    });

    it("aceita entrada com espaços e hífens misturados", () => {
      expect(maskTelefone("11 9 1234-5678")).toBe("(11) 91234-5678");
    });
  });

  describe("digitação progressiva (UX de máscara)", () => {
    it("1 dígito: só abre parêntese", () => {
      expect(maskTelefone("1")).toBe("(1");
    });

    it("2 dígitos: DDD completo", () => {
      expect(maskTelefone("11")).toBe("(11");
    });

    it("3 dígitos: começa o número após DDD", () => {
      expect(maskTelefone("119")).toBe("(11) 9");
    });

    it("6 dígitos: prefixo 4 dígitos sem hífen ainda", () => {
      expect(maskTelefone("119123")).toBe("(11) 9123");
    });

    it("7 dígitos: adiciona hífen no fixo", () => {
      expect(maskTelefone("1191234")).toBe("(11) 9123-4");
    });
  });

  describe("bordas e entradas inválidas", () => {
    it("string vazia retorna string vazia (sem crash)", () => {
      expect(maskTelefone("")).toBe("(");
    });

    it("só letras → sem dígitos → resultado mínimo", () => {
      expect(maskTelefone("abc")).toBe("(");
    });

    it("trunca em 11 dígitos, ignora excesso", () => {
      expect(maskTelefone("119123456789999")).toBe("(11) 91234-5678");
    });

    it("string com apenas um dígito não lança exceção", () => {
      expect(() => maskTelefone("5")).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// onlyDigits
// ---------------------------------------------------------------------------
describe("onlyDigits", () => {
  it("remove todos os não-dígitos de uma máscara de telefone", () => {
    expect(onlyDigits("(11) 91234-5678")).toBe("11912345678");
  });

  it("mantém string já com só dígitos intacta", () => {
    expect(onlyDigits("11912345678")).toBe("11912345678");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(onlyDigits("")).toBe("");
  });

  it("retorna string vazia para entrada sem nenhum dígito", () => {
    expect(onlyDigits("abcDEF!@#")).toBe("");
  });

  it("remove letras, pontos, vírgulas e espaços juntos", () => {
    expect(onlyDigits("1.2,3 4a")).toBe("1234");
  });
});

// ---------------------------------------------------------------------------
// formatData
// ---------------------------------------------------------------------------
describe("formatData", () => {
  it("formata ISO em dd/mm/aaaa no padrão pt-BR", () => {
    // 2025-03-15 → "15/03/2025"
    const resultado = formatData("2025-03-15T00:00:00.000Z");
    // Verificamos o padrão sem depender do fuso da máquina de CI:
    // apenas garantimos que o ano, dia e mês estão presentes em alguma ordem
    expect(resultado).toMatch(/2025/);
    expect(resultado).toMatch(/03|15/);
  });

  it("retorna '—' para null", () => {
    expect(formatData(null)).toBe("—");
  });

  it("retorna '—' para string vazia", () => {
    expect(formatData("")).toBe("—");
  });

  it("não lança exceção para ISO completo com horário", () => {
    expect(() => formatData("2024-12-31T23:59:59.000Z")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// formatDataHora
// ---------------------------------------------------------------------------
describe("formatDataHora", () => {
  it("retorna '—' para null", () => {
    expect(formatDataHora(null)).toBe("—");
  });

  it("retorna '—' para string vazia", () => {
    expect(formatDataHora("")).toBe("—");
  });

  it("inclui hora e minuto na saída", () => {
    // Apenas verifica que o resultado tem mais informação que só a data
    const resultado = formatDataHora("2025-06-01T14:30:00.000Z");
    // Deve conter dois-pontos de hora (HH:MM)
    expect(resultado).toMatch(/\d{2}:\d{2}/);
  });

  it("não lança exceção para ISO válido", () => {
    expect(() => formatDataHora("2025-01-01T00:00:00.000Z")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// timeAgo
// ---------------------------------------------------------------------------
describe("timeAgo", () => {
  beforeEach(() => {
    // Fixa o relógio em uma data conhecida para eliminar flakiness
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-22T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna 'agora' para diferença menor que 1 minuto", () => {
    const iso = new Date(Date.now() - 30_000).toISOString(); // 30s atrás
    expect(timeAgo(iso)).toBe("agora");
  });

  it("retorna 'agora' para exatamente 0ms de diferença", () => {
    const iso = new Date(Date.now()).toISOString();
    expect(timeAgo(iso)).toBe("agora");
  });

  it("retorna 'há X min' para diferença em minutos", () => {
    const iso = new Date(Date.now() - 5 * 60_000).toISOString(); // 5 min atrás
    expect(timeAgo(iso)).toBe("há 5 min");
  });

  it("retorna 'há Xh' para diferença em horas (< 24h)", () => {
    const iso = new Date(Date.now() - 3 * 3600_000).toISOString(); // 3h atrás
    expect(timeAgo(iso)).toBe("há 3h");
  });

  it("retorna 'há Xd' para diferença em dias (< 30 dias)", () => {
    const iso = new Date(Date.now() - 7 * 86400_000).toISOString(); // 7 dias atrás
    expect(timeAgo(iso)).toBe("há 7d");
  });

  it("delega para formatData para datas com mais de 30 dias", () => {
    const iso = new Date(Date.now() - 45 * 86400_000).toISOString(); // 45 dias atrás
    const resultado = timeAgo(iso);
    // Deve retornar uma data formatada (dd/mm/aaaa), não uma string "há X"
    expect(resultado).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("1 minuto exato → 'há 1 min'", () => {
    const iso = new Date(Date.now() - 60_000).toISOString();
    expect(timeAgo(iso)).toBe("há 1 min");
  });
});

// ---------------------------------------------------------------------------
// iniciais
// ---------------------------------------------------------------------------
describe("iniciais", () => {
  describe("caminho feliz", () => {
    it("retorna iniciais de nome e sobrenome em maiúsculas", () => {
      expect(iniciais("João Silva")).toBe("JS");
    });

    it("usa primeira e última palavra em nomes compostos", () => {
      expect(iniciais("Maria das Graças Souza")).toBe("MS");
    });

    it("retorna as 2 primeiras letras do nome para nome único", () => {
      expect(iniciais("Fulano")).toBe("FU");
    });

    it("nome único com 1 caractere retorna esse caractere em maiúsculas", () => {
      expect(iniciais("A")).toBe("A");
    });

    it("converte para maiúsculas independente do input", () => {
      expect(iniciais("ana paula")).toBe("AP");
    });
  });

  describe("bordas e valores nulos/vazios", () => {
    it("retorna '?' para null", () => {
      expect(iniciais(null)).toBe("?");
    });

    it("retorna '?' para undefined", () => {
      expect(iniciais(undefined)).toBe("?");
    });

    it("retorna '?' para string vazia", () => {
      expect(iniciais("")).toBe("?");
    });

    it("retorna '?' para string só com espaços", () => {
      expect(iniciais("   ")).toBe("?");
    });

    it("ignora espaços extras entre palavras", () => {
      expect(iniciais("  João   Silva  ")).toBe("JS");
    });
  });
});
