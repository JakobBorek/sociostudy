export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      annotations: {
        Row: {
          color: string | null
          comment: string | null
          created_at: string
          id: string
          range_from: number
          range_to: number
          text: string | null
          type: string
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          range_from: number
          range_to: number
          text?: string | null
          type: string
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          range_from?: number
          range_to?: number
          text?: string | null
          type?: string
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answer: string | null
          created_at: string
          feedback: string | null
          id: string
          marks: number | null
          question_id: string | null
          question_text: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          marks?: number | null
          question_id?: string | null
          question_text?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          marks?: number | null
          question_id?: string | null
          question_text?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      flashcard_progress: {
        Row: {
          id: string
          reviewed_at: string
          status: string
          topic_id: string
          user_id: string
        }
        Insert: {
          id?: string
          reviewed_at?: string
          status: string
          topic_id: string
          user_id: string
        }
        Update: {
          id?: string
          reviewed_at?: string
          status?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: []
      }
      gap_fill_answers: {
        Row: {
          answers: Json
          id: string
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          id?: string
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          id?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mock_exams: {
        Row: {
          answers: Json
          created_at: string
          grades: Json
          id: string
          paper: Json
          status: string
          total_available: number | null
          total_awarded: number | null
          unit_id: string
          unit_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          grades?: Json
          id?: string
          paper?: Json
          status?: string
          total_available?: number | null
          total_awarded?: number | null
          unit_id: string
          unit_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          grades?: Json
          id?: string
          paper?: Json
          status?: string
          total_available?: number | null
          total_awarded?: number | null
          unit_id?: string
          unit_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notebook_pages: {
        Row: {
          content: Json
          created_at: string
          id: string
          position: number
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          position?: number
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          position?: number
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
