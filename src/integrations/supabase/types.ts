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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          landlord_id: string
          landlord_notes: string | null
          listing_id: string
          renter_id: string
          renter_snapshot: Json | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          viewing_date: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          landlord_id: string
          landlord_notes?: string | null
          listing_id: string
          renter_id: string
          renter_snapshot?: Json | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          viewing_date?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          landlord_id?: string
          landlord_notes?: string | null
          listing_id?: string
          renter_id?: string
          renter_snapshot?: Json | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          viewing_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_marked_unread_by_landlord: boolean | null
          is_marked_unread_by_renter: boolean | null
          is_pinned_by_landlord: boolean | null
          is_pinned_by_renter: boolean | null
          landlord_id: string
          last_message_at: string | null
          listing_id: string
          renter_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_marked_unread_by_landlord?: boolean | null
          is_marked_unread_by_renter?: boolean | null
          is_pinned_by_landlord?: boolean | null
          is_pinned_by_renter?: boolean | null
          landlord_id: string
          last_message_at?: string | null
          listing_id: string
          renter_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_marked_unread_by_landlord?: boolean | null
          is_marked_unread_by_renter?: boolean | null
          is_pinned_by_landlord?: boolean | null
          is_pinned_by_renter?: boolean | null
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
      listing_stats: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          view_count: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          view_count?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_stats_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          ac_type: string | null
          ac_unit_count: number | null
          address: string
          allows_pets: boolean | null
          area_sqm: number | null
          available_from: string | null
          available_until: string | null
          balcony_sqm: number | null
          bathrooms: number
          bedrooms: number
          city: string
          completed_at: string | null
          country: string
          created_at: string
          currency: string
          current_step: number | null
          deposit_amount: number | null
          deposit_months: number | null
          deposit_required: boolean | null
          deposit_type: string | null
          description: string | null
          elevator_condition: string | null
          energy_rating: string | null
          ev_charger_power: string | null
          expense_breakdown_enabled: boolean | null
          expense_hoa_fees: number | null
          expense_insurance: number | null
          expense_maintenance: number | null
          expense_other: number | null
          expense_property_tax: number | null
          expense_utilities: number | null
          final_price: number | null
          floor_number: number | null
          floor_plan_url: string | null
          floor_plan_urls: string[] | null
          furnished_details: string | null
          garden_sqm: number | null
          has_air_conditioning: boolean | null
          has_alarm_system: boolean | null
          has_balcony: boolean | null
          has_basement: boolean | null
          has_bbq_area: boolean | null
          has_bicycle_storage: boolean | null
          has_built_in_wardrobes: boolean | null
          has_carport: boolean | null
          has_cctv: boolean | null
          has_common_room: boolean | null
          has_concierge: boolean | null
          has_dishwasher: boolean | null
          has_district_heating: boolean | null
          has_dryer: boolean | null
          has_electric_shades: boolean | null
          has_elevator: boolean | null
          has_elevator_from_garage: boolean | null
          has_ev_charging: boolean | null
          has_fire_safety: boolean | null
          has_fireplace: boolean | null
          has_floor_cooling: boolean | null
          has_floor_heating: boolean | null
          has_garage: boolean | null
          has_garden: boolean | null
          has_gated_community: boolean | null
          has_ground_floor_access: boolean | null
          has_gym: boolean | null
          has_heat_pump: boolean | null
          has_heat_recovery_ventilation: boolean | null
          has_high_ceilings: boolean | null
          has_home_battery: boolean | null
          has_intercom: boolean | null
          has_large_windows: boolean | null
          has_parking: boolean | null
          has_playground: boolean | null
          has_pool: boolean | null
          has_rooftop_terrace: boolean | null
          has_sauna: boolean | null
          has_secure_entrance: boolean | null
          has_security: boolean | null
          has_shared_laundry: boolean | null
          has_smart_home: boolean | null
          has_solar_panels: boolean | null
          has_soundproofing: boolean | null
          has_step_free_access: boolean | null
          has_storage: boolean | null
          has_stroller_storage: boolean | null
          has_terrace: boolean | null
          has_ventilation: boolean | null
          has_view: boolean | null
          has_washing_machine: boolean | null
          has_waterfront: boolean | null
          has_wheelchair_accessible: boolean | null
          has_wide_doorways: boolean | null
          has_window_shades: boolean | null
          heating_distribution: string | null
          heating_type: string | null
          house_type: string | null
          id: string
          images: string[] | null
          individual_heater_types: string[] | null
          internet_included: string | null
          is_active: boolean
          is_draft: boolean
          is_furnished: boolean | null
          latitude: number
          listing_type: Database["public"]["Enums"]["listing_type"]
          living_rooms: number | null
          longitude: number
          min_lease_months: number | null
          monthly_expenses: number | null
          move_in_immediately: boolean | null
          orientation: string | null
          parking_spaces: number | null
          parking_type: string | null
          pets_details: string | null
          postal_code: string | null
          price: number
          property_condition: string | null
          property_floors: number | null
          property_type: Database["public"]["Enums"]["property_type"]
          rent_indefinitely: boolean | null
          status: string | null
          terrace_sqm: number | null
          title: string
          total_floors_building: number | null
          updated_at: string
          user_id: string | null
          utilities_included: string | null
          utility_cost_estimate: number | null
          view_type: string | null
          waterfront_distance_m: number | null
          year_built: number | null
        }
        Insert: {
          ac_type?: string | null
          ac_unit_count?: number | null
          address: string
          allows_pets?: boolean | null
          area_sqm?: number | null
          available_from?: string | null
          available_until?: string | null
          balcony_sqm?: number | null
          bathrooms?: number
          bedrooms?: number
          city: string
          completed_at?: string | null
          country?: string
          created_at?: string
          currency?: string
          current_step?: number | null
          deposit_amount?: number | null
          deposit_months?: number | null
          deposit_required?: boolean | null
          deposit_type?: string | null
          description?: string | null
          elevator_condition?: string | null
          energy_rating?: string | null
          ev_charger_power?: string | null
          expense_breakdown_enabled?: boolean | null
          expense_hoa_fees?: number | null
          expense_insurance?: number | null
          expense_maintenance?: number | null
          expense_other?: number | null
          expense_property_tax?: number | null
          expense_utilities?: number | null
          final_price?: number | null
          floor_number?: number | null
          floor_plan_url?: string | null
          floor_plan_urls?: string[] | null
          furnished_details?: string | null
          garden_sqm?: number | null
          has_air_conditioning?: boolean | null
          has_alarm_system?: boolean | null
          has_balcony?: boolean | null
          has_basement?: boolean | null
          has_bbq_area?: boolean | null
          has_bicycle_storage?: boolean | null
          has_built_in_wardrobes?: boolean | null
          has_carport?: boolean | null
          has_cctv?: boolean | null
          has_common_room?: boolean | null
          has_concierge?: boolean | null
          has_dishwasher?: boolean | null
          has_district_heating?: boolean | null
          has_dryer?: boolean | null
          has_electric_shades?: boolean | null
          has_elevator?: boolean | null
          has_elevator_from_garage?: boolean | null
          has_ev_charging?: boolean | null
          has_fire_safety?: boolean | null
          has_fireplace?: boolean | null
          has_floor_cooling?: boolean | null
          has_floor_heating?: boolean | null
          has_garage?: boolean | null
          has_garden?: boolean | null
          has_gated_community?: boolean | null
          has_ground_floor_access?: boolean | null
          has_gym?: boolean | null
          has_heat_pump?: boolean | null
          has_heat_recovery_ventilation?: boolean | null
          has_high_ceilings?: boolean | null
          has_home_battery?: boolean | null
          has_intercom?: boolean | null
          has_large_windows?: boolean | null
          has_parking?: boolean | null
          has_playground?: boolean | null
          has_pool?: boolean | null
          has_rooftop_terrace?: boolean | null
          has_sauna?: boolean | null
          has_secure_entrance?: boolean | null
          has_security?: boolean | null
          has_shared_laundry?: boolean | null
          has_smart_home?: boolean | null
          has_solar_panels?: boolean | null
          has_soundproofing?: boolean | null
          has_step_free_access?: boolean | null
          has_storage?: boolean | null
          has_stroller_storage?: boolean | null
          has_terrace?: boolean | null
          has_ventilation?: boolean | null
          has_view?: boolean | null
          has_washing_machine?: boolean | null
          has_waterfront?: boolean | null
          has_wheelchair_accessible?: boolean | null
          has_wide_doorways?: boolean | null
          has_window_shades?: boolean | null
          heating_distribution?: string | null
          heating_type?: string | null
          house_type?: string | null
          id?: string
          images?: string[] | null
          individual_heater_types?: string[] | null
          internet_included?: string | null
          is_active?: boolean
          is_draft?: boolean
          is_furnished?: boolean | null
          latitude: number
          listing_type?: Database["public"]["Enums"]["listing_type"]
          living_rooms?: number | null
          longitude: number
          min_lease_months?: number | null
          monthly_expenses?: number | null
          move_in_immediately?: boolean | null
          orientation?: string | null
          parking_spaces?: number | null
          parking_type?: string | null
          pets_details?: string | null
          postal_code?: string | null
          price: number
          property_condition?: string | null
          property_floors?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          rent_indefinitely?: boolean | null
          status?: string | null
          terrace_sqm?: number | null
          title: string
          total_floors_building?: number | null
          updated_at?: string
          user_id?: string | null
          utilities_included?: string | null
          utility_cost_estimate?: number | null
          view_type?: string | null
          waterfront_distance_m?: number | null
          year_built?: number | null
        }
        Update: {
          ac_type?: string | null
          ac_unit_count?: number | null
          address?: string
          allows_pets?: boolean | null
          area_sqm?: number | null
          available_from?: string | null
          available_until?: string | null
          balcony_sqm?: number | null
          bathrooms?: number
          bedrooms?: number
          city?: string
          completed_at?: string | null
          country?: string
          created_at?: string
          currency?: string
          current_step?: number | null
          deposit_amount?: number | null
          deposit_months?: number | null
          deposit_required?: boolean | null
          deposit_type?: string | null
          description?: string | null
          elevator_condition?: string | null
          energy_rating?: string | null
          ev_charger_power?: string | null
          expense_breakdown_enabled?: boolean | null
          expense_hoa_fees?: number | null
          expense_insurance?: number | null
          expense_maintenance?: number | null
          expense_other?: number | null
          expense_property_tax?: number | null
          expense_utilities?: number | null
          final_price?: number | null
          floor_number?: number | null
          floor_plan_url?: string | null
          floor_plan_urls?: string[] | null
          furnished_details?: string | null
          garden_sqm?: number | null
          has_air_conditioning?: boolean | null
          has_alarm_system?: boolean | null
          has_balcony?: boolean | null
          has_basement?: boolean | null
          has_bbq_area?: boolean | null
          has_bicycle_storage?: boolean | null
          has_built_in_wardrobes?: boolean | null
          has_carport?: boolean | null
          has_cctv?: boolean | null
          has_common_room?: boolean | null
          has_concierge?: boolean | null
          has_dishwasher?: boolean | null
          has_district_heating?: boolean | null
          has_dryer?: boolean | null
          has_electric_shades?: boolean | null
          has_elevator?: boolean | null
          has_elevator_from_garage?: boolean | null
          has_ev_charging?: boolean | null
          has_fire_safety?: boolean | null
          has_fireplace?: boolean | null
          has_floor_cooling?: boolean | null
          has_floor_heating?: boolean | null
          has_garage?: boolean | null
          has_garden?: boolean | null
          has_gated_community?: boolean | null
          has_ground_floor_access?: boolean | null
          has_gym?: boolean | null
          has_heat_pump?: boolean | null
          has_heat_recovery_ventilation?: boolean | null
          has_high_ceilings?: boolean | null
          has_home_battery?: boolean | null
          has_intercom?: boolean | null
          has_large_windows?: boolean | null
          has_parking?: boolean | null
          has_playground?: boolean | null
          has_pool?: boolean | null
          has_rooftop_terrace?: boolean | null
          has_sauna?: boolean | null
          has_secure_entrance?: boolean | null
          has_security?: boolean | null
          has_shared_laundry?: boolean | null
          has_smart_home?: boolean | null
          has_solar_panels?: boolean | null
          has_soundproofing?: boolean | null
          has_step_free_access?: boolean | null
          has_storage?: boolean | null
          has_stroller_storage?: boolean | null
          has_terrace?: boolean | null
          has_ventilation?: boolean | null
          has_view?: boolean | null
          has_washing_machine?: boolean | null
          has_waterfront?: boolean | null
          has_wheelchair_accessible?: boolean | null
          has_wide_doorways?: boolean | null
          has_window_shades?: boolean | null
          heating_distribution?: string | null
          heating_type?: string | null
          house_type?: string | null
          id?: string
          images?: string[] | null
          individual_heater_types?: string[] | null
          internet_included?: string | null
          is_active?: boolean
          is_draft?: boolean
          is_furnished?: boolean | null
          latitude?: number
          listing_type?: Database["public"]["Enums"]["listing_type"]
          living_rooms?: number | null
          longitude?: number
          min_lease_months?: number | null
          monthly_expenses?: number | null
          move_in_immediately?: boolean | null
          orientation?: string | null
          parking_spaces?: number | null
          parking_type?: string | null
          pets_details?: string | null
          postal_code?: string | null
          price?: number
          property_condition?: string | null
          property_floors?: number | null
          property_type?: Database["public"]["Enums"]["property_type"]
          rent_indefinitely?: boolean | null
          status?: string | null
          terrace_sqm?: number | null
          title?: string
          total_floors_building?: number | null
          updated_at?: string
          user_id?: string | null
          utilities_included?: string | null
          utility_cost_estimate?: number | null
          view_type?: string | null
          waterfront_distance_m?: number | null
          year_built?: number | null
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string
          mime_type: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number
          file_type?: string
          file_url: string
          id?: string
          message_id: string
          mime_type?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
          mime_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          is_read: boolean
          original_content: string | null
          read_at: string | null
          reply_to_message_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_read?: boolean
          original_content?: string | null
          read_at?: string | null
          reply_to_message_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_read?: boolean
          original_content?: string | null
          read_at?: string | null
          reply_to_message_id?: string | null
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
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_bracket: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          default_cover_letter: string | null
          education_level: string | null
          employment_other: string | null
          employment_status: string | null
          full_name: string | null
          has_kids: boolean | null
          has_pets: boolean | null
          household_size: number | null
          id: string
          is_smoker: boolean | null
          kids_ages: string | null
          kids_count: number | null
          looking_duration: string | null
          looking_duration_date: string | null
          management_type: string | null
          marital_status: string | null
          monthly_income_range: string | null
          move_in_timeline: string | null
          nationality: string | null
          num_properties: number | null
          occupation: string | null
          onboarding_completed: boolean | null
          pet_details: string | null
          phone: string | null
          renter_references: Json | null
          response_time: string | null
          social_links: Json | null
          updated_at: string
          user_id: string
          user_intents: string[] | null
        }
        Insert: {
          age_bracket?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          default_cover_letter?: string | null
          education_level?: string | null
          employment_other?: string | null
          employment_status?: string | null
          full_name?: string | null
          has_kids?: boolean | null
          has_pets?: boolean | null
          household_size?: number | null
          id?: string
          is_smoker?: boolean | null
          kids_ages?: string | null
          kids_count?: number | null
          looking_duration?: string | null
          looking_duration_date?: string | null
          management_type?: string | null
          marital_status?: string | null
          monthly_income_range?: string | null
          move_in_timeline?: string | null
          nationality?: string | null
          num_properties?: number | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          pet_details?: string | null
          phone?: string | null
          renter_references?: Json | null
          response_time?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
          user_intents?: string[] | null
        }
        Update: {
          age_bracket?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          default_cover_letter?: string | null
          education_level?: string | null
          employment_other?: string | null
          employment_status?: string | null
          full_name?: string | null
          has_kids?: boolean | null
          has_pets?: boolean | null
          household_size?: number | null
          id?: string
          is_smoker?: boolean | null
          kids_ages?: string | null
          kids_count?: number | null
          looking_duration?: string | null
          looking_duration_date?: string | null
          management_type?: string | null
          marital_status?: string | null
          monthly_income_range?: string | null
          move_in_timeline?: string | null
          nationality?: string | null
          num_properties?: number | null
          occupation?: string | null
          onboarding_completed?: boolean | null
          pet_details?: string | null
          phone?: string | null
          renter_references?: Json | null
          response_time?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          user_intents?: string[] | null
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
      are_in_conversation: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
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
      get_profile_for_viewer: {
        Args: { p_profile_user_id: string }
        Returns: {
          age_bracket: string
          avatar_url: string
          bio: string
          created_at: string
          default_cover_letter: string
          education_level: string
          employment_other: string
          employment_status: string
          full_name: string
          has_kids: boolean
          has_pets: boolean
          household_size: number
          id: string
          is_smoker: boolean
          kids_ages: string
          kids_count: number
          looking_duration: string
          looking_duration_date: string
          management_type: string
          marital_status: string
          monthly_income_range: string
          move_in_timeline: string
          nationality: string
          num_properties: number
          occupation: string
          onboarding_completed: boolean
          pet_details: string
          phone: string
          renter_references: Json
          response_time: string
          social_links: Json
          updated_at: string
          user_id: string
          user_intents: string[]
        }[]
      }
      increment_listing_view: {
        Args: { p_listing_id: string }
        Returns: undefined
      }
    }
    Enums: {
      application_status:
        | "applied"
        | "viewing_scheduled"
        | "under_review"
        | "accepted"
        | "declined"
      listing_type: "rent" | "sale"
      property_type:
        | "apartment"
        | "house"
        | "room"
        | "studio"
        | "villa"
        | "other"
        | "summer_house"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "applied",
        "viewing_scheduled",
        "under_review",
        "accepted",
        "declined",
      ],
      listing_type: ["rent", "sale"],
      property_type: [
        "apartment",
        "house",
        "room",
        "studio",
        "villa",
        "other",
        "summer_house",
      ],
    },
  },
} as const
