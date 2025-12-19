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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          landlord_id: string
          last_message_at: string | null
          listing_id: string
          renter_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          landlord_id: string
          last_message_at?: string | null
          listing_id: string
          renter_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          landlord_id?: string
          last_message_at?: string | null
          listing_id?: string
          renter_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string
          allows_pets: boolean | null
          area_sqm: number | null
          available_from: string | null
          available_until: string | null
          bathrooms: number
          bedrooms: number
          city: string
          country: string
          created_at: string
          currency: string
          deposit_amount: number | null
          description: string | null
          energy_rating: string | null
          floor_number: number | null
          floor_plan_url: string | null
          garden_sqm: number | null
          has_air_conditioning: boolean | null
          has_balcony: boolean | null
          has_dishwasher: boolean | null
          has_elevator: boolean | null
          has_garage: boolean | null
          has_garden: boolean | null
          has_parking: boolean | null
          has_storage: boolean | null
          has_terrace: boolean | null
          has_washing_machine: boolean | null
          heating_type: string | null
          id: string
          images: string[] | null
          internet_included: string | null
          is_active: boolean
          is_furnished: boolean | null
          latitude: number
          listing_type: Database["public"]["Enums"]["listing_type"]
          longitude: number
          min_lease_months: number | null
          parking_spaces: number | null
          parking_type: string | null
          postal_code: string | null
          price: number
          property_condition: string | null
          property_floors: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          title: string
          total_floors_building: number | null
          updated_at: string
          user_id: string | null
          utilities_included: string | null
          year_built: number | null
        }
        Insert: {
          address: string
          allows_pets?: boolean | null
          area_sqm?: number | null
          available_from?: string | null
          available_until?: string | null
          bathrooms?: number
          bedrooms?: number
          city: string
          country?: string
          created_at?: string
          currency?: string
          deposit_amount?: number | null
          description?: string | null
          energy_rating?: string | null
          floor_number?: number | null
          floor_plan_url?: string | null
          garden_sqm?: number | null
          has_air_conditioning?: boolean | null
          has_balcony?: boolean | null
          has_dishwasher?: boolean | null
          has_elevator?: boolean | null
          has_garage?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          has_storage?: boolean | null
          has_terrace?: boolean | null
          has_washing_machine?: boolean | null
          heating_type?: string | null
          id?: string
          images?: string[] | null
          internet_included?: string | null
          is_active?: boolean
          is_furnished?: boolean | null
          latitude: number
          listing_type?: Database["public"]["Enums"]["listing_type"]
          longitude: number
          min_lease_months?: number | null
          parking_spaces?: number | null
          parking_type?: string | null
          postal_code?: string | null
          price: number
          property_condition?: string | null
          property_floors?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          title: string
          total_floors_building?: number | null
          updated_at?: string
          user_id?: string | null
          utilities_included?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string
          allows_pets?: boolean | null
          area_sqm?: number | null
          available_from?: string | null
          available_until?: string | null
          bathrooms?: number
          bedrooms?: number
          city?: string
          country?: string
          created_at?: string
          currency?: string
          deposit_amount?: number | null
          description?: string | null
          energy_rating?: string | null
          floor_number?: number | null
          floor_plan_url?: string | null
          garden_sqm?: number | null
          has_air_conditioning?: boolean | null
          has_balcony?: boolean | null
          has_dishwasher?: boolean | null
          has_elevator?: boolean | null
          has_garage?: boolean | null
          has_garden?: boolean | null
          has_parking?: boolean | null
          has_storage?: boolean | null
          has_terrace?: boolean | null
          has_washing_machine?: boolean | null
          heating_type?: string | null
          id?: string
          images?: string[] | null
          internet_included?: string | null
          is_active?: boolean
          is_furnished?: boolean | null
          latitude?: number
          listing_type?: Database["public"]["Enums"]["listing_type"]
          longitude?: number
          min_lease_months?: number | null
          parking_spaces?: number | null
          parking_type?: string | null
          postal_code?: string | null
          price?: number
          property_condition?: string | null
          property_floors?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          title?: string
          total_floors_building?: number | null
          updated_at?: string
          user_id?: string | null
          utilities_included?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_daily_digest: boolean
          email_on_new_message: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_daily_digest?: boolean
          email_on_new_message?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_daily_digest?: boolean
          email_on_new_message?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      recently_viewed_listings: {
        Row: {
          id: string
          listing_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_attempts: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
    }
    Enums: {
      listing_type: "rent" | "sale"
      property_type:
        | "apartment"
        | "house"
        | "room"
        | "studio"
        | "villa"
        | "other"
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
    Enums: {
      listing_type: ["rent", "sale"],
      property_type: ["apartment", "house", "room", "studio", "villa", "other"],
    },
  },
} as const
