/**
 * Placeholder Database types for the Supabase client.
 * Replace with generated types after migrations are applied:
 *   npx supabase gen types typescript --project-id <id> > src/services/supabase/database.types.ts
 *
 * Full schema design: docs/DATABASE_SCHEMA.md
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          city: string | null;
          avatar_url: string | null;
          skills: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          skills?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          skills?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
