export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      atividades: {
        Row: {
          autor_id: string | null
          cliente_id: string
          conteudo: string
          created_at: string
          id: string
          tipo: string
        }
        Insert: {
          autor_id?: string | null
          cliente_id: string
          conteudo: string
          created_at?: string
          id?: string
          tipo?: string
        }
        Update: {
          autor_id?: string | null
          cliente_id?: string
          conteudo?: string
          created_at?: string
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          acao: string
          ator_id: string | null
          created_at: string
          diff: Json | null
          entidade: string
          entidade_id: string | null
          id: string
          resumo: string | null
        }
        Insert: {
          acao: string
          ator_id?: string | null
          created_at?: string
          diff?: Json | null
          entidade: string
          entidade_id?: string | null
          id?: string
          resumo?: string | null
        }
        Update: {
          acao?: string
          ator_id?: string | null
          created_at?: string
          diff?: Json | null
          entidade?: string
          entidade_id?: string | null
          id?: string
          resumo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_ator_id_fkey"
            columns: ["ator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          empresa: string | null
          estagio: string
          id: string
          nome: string
          owner_id: string | null
          tags: string[]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          empresa?: string | null
          estagio?: string
          id?: string
          nome: string
          owner_id?: string | null
          tags?: string[]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          empresa?: string | null
          estagio?: string
          id?: string
          nome?: string
          owner_id?: string | null
          tags?: string[]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          cliente_id: string | null
          concluida: boolean
          created_at: string
          descricao: string | null
          due_date: string | null
          id: string
          responsavel_id: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          concluida?: boolean
          created_at?: string
          descricao?: string | null
          due_date?: string | null
          id?: string
          responsavel_id?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          concluida?: boolean
          created_at?: string
          descricao?: string | null
          due_date?: string | null
          id?: string
          responsavel_id?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]

export type Cliente = PublicSchema["Tables"]["clientes"]["Row"]
export type ClienteInsert = PublicSchema["Tables"]["clientes"]["Insert"]
export type ClienteUpdate = PublicSchema["Tables"]["clientes"]["Update"]
export type Profile = PublicSchema["Tables"]["profiles"]["Row"]
export type Atividade = PublicSchema["Tables"]["atividades"]["Row"]
export type Tarefa = PublicSchema["Tables"]["tarefas"]["Row"]
export type AuditLog = PublicSchema["Tables"]["audit_log"]["Row"]
