/**
 * Hand-written Database types aligned with supabase/migrations.
 * Regenerate after applying migrations to a live project:
 *   npx supabase gen types typescript --project-id <id> > src/services/supabase/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AnimalSpecies = 'dog' | 'cat' | 'other';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type AnimalStatus = 'active' | 'resolved' | 'archived';
export type HelpType =
  | 'catch'
  | 'transport'
  | 'vet'
  | 'foster'
  | 'permanent_home'
  | 'food'
  | 'other';
export type HelpRequestStatus = 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type HelpOfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type AnimalUpdateEventType = 'comment' | 'status_change' | 'photo' | 'system';
export type ReportTargetType = 'animal' | 'profile';
export type ReportStatus = 'open' | 'reviewed' | 'dismissed';

export type ProfileRow = {
  id: string;
  display_name: string | null;
  city: string | null;
  avatar_url: string | null;
  skills: string[];
  contact_phone: string | null;
  contact_note: string | null;
  is_anonymized: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          display_name?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          skills?: string[];
          contact_phone?: string | null;
          contact_note?: string | null;
          is_anonymized?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          skills?: string[];
          contact_phone?: string | null;
          contact_note?: string | null;
          is_anonymized?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      animals: {
        Row: {
          id: string;
          author_id: string | null;
          name: string | null;
          species: AnimalSpecies;
          description: string | null;
          condition_notes: string | null;
          urgency: UrgencyLevel;
          status: AnimalStatus;
          city: string;
          location_label: string | null;
          photo_paths: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          name?: string | null;
          species: AnimalSpecies;
          description?: string | null;
          condition_notes?: string | null;
          urgency?: UrgencyLevel;
          status?: AnimalStatus;
          city: string;
          location_label?: string | null;
          photo_paths?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          name?: string | null;
          species?: AnimalSpecies;
          description?: string | null;
          condition_notes?: string | null;
          urgency?: UrgencyLevel;
          status?: AnimalStatus;
          city?: string;
          location_label?: string | null;
          photo_paths?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'animals_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      help_requests: {
        Row: {
          id: string;
          animal_id: string;
          created_by: string | null;
          help_type: HelpType;
          title: string;
          description: string | null;
          status: HelpRequestStatus;
          assignee_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          created_by?: string | null;
          help_type: HelpType;
          title: string;
          description?: string | null;
          status?: HelpRequestStatus;
          assignee_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          created_by?: string | null;
          help_type?: HelpType;
          title?: string;
          description?: string | null;
          status?: HelpRequestStatus;
          assignee_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'help_requests_animal_id_fkey';
            columns: ['animal_id'];
            isOneToOne: false;
            referencedRelation: 'animals';
            referencedColumns: ['id'];
          },
        ];
      };
      help_offers: {
        Row: {
          id: string;
          help_request_id: string;
          offerer_id: string | null;
          message: string | null;
          meetup_details: string | null;
          status: HelpOfferStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          help_request_id: string;
          offerer_id?: string | null;
          message?: string | null;
          meetup_details?: string | null;
          status?: HelpOfferStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          help_request_id?: string;
          offerer_id?: string | null;
          message?: string | null;
          meetup_details?: string | null;
          status?: HelpOfferStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'help_offers_help_request_id_fkey';
            columns: ['help_request_id'];
            isOneToOne: false;
            referencedRelation: 'help_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      animal_updates: {
        Row: {
          id: string;
          animal_id: string;
          author_id: string | null;
          help_request_id: string | null;
          body: string;
          event_type: AnimalUpdateEventType;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          author_id?: string | null;
          help_request_id?: string | null;
          body: string;
          event_type?: AnimalUpdateEventType;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          author_id?: string | null;
          help_request_id?: string | null;
          body?: string;
          event_type?: AnimalUpdateEventType;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'animal_updates_animal_id_fkey';
            columns: ['animal_id'];
            isOneToOne: false;
            referencedRelation: 'animals';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          payload?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string | null;
          target_type: ReportTargetType;
          target_id: string;
          reason: string;
          details: string | null;
          status: ReportStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id?: string | null;
          target_type: ReportTargetType;
          target_id: string;
          reason: string;
          details?: string | null;
          status?: ReportStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string | null;
          target_type?: ReportTargetType;
          target_id?: string;
          reason?: string;
          details?: string | null;
          status?: ReportStatus;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      profiles_public: {
        Row: {
          id: string;
          display_name: string | null;
          city: string | null;
          avatar_url: string | null;
          skills: string[];
          is_anonymized: boolean;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
      help_offers_safe: {
        Row: {
          id: string;
          help_request_id: string;
          offerer_id: string | null;
          message: string | null;
          meetup_details: string | null;
          status: HelpOfferStatus;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      anonymize_account: { Args: Record<string, never>; Returns: undefined };
      get_own_profile: { Args: Record<string, never>; Returns: ProfileRow };
      get_profile_contact: {
        Args: { p_profile_id: string };
        Returns: { contact_phone: string | null; contact_note: string | null }[];
      };
    };
    Enums: {
      animal_species: AnimalSpecies;
      urgency_level: UrgencyLevel;
      animal_status: AnimalStatus;
      help_type: HelpType;
      help_request_status: HelpRequestStatus;
      help_offer_status: HelpOfferStatus;
      animal_update_event_type: AnimalUpdateEventType;
      report_target_type: ReportTargetType;
      report_status: ReportStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type Animal = Database['public']['Tables']['animals']['Row'];
export type AnimalInsert = Database['public']['Tables']['animals']['Insert'];
export type HelpRequest = Database['public']['Tables']['help_requests']['Row'];
export type HelpRequestInsert = Database['public']['Tables']['help_requests']['Insert'];
export type PublicProfile = Database['public']['Views']['profiles_public']['Row'];
