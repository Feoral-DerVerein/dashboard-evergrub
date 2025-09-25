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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ad_analytics: {
        Row: {
          ad_id: string
          clicks: number
          cost: number
          created_at: string
          date: string
          id: string
          impressions: number
        }
        Insert: {
          ad_id: string
          clicks?: number
          cost?: number
          created_at?: string
          date?: string
          id?: string
          impressions?: number
        }
        Update: {
          ad_id?: string
          clicks?: number
          cost?: number
          created_at?: string
          date?: string
          id?: string
          impressions?: number
        }
        Relationships: [
          {
            foreignKeyName: "ad_analytics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_campaigns: {
        Row: {
          budget: number
          created_at: string
          end_date: string | null
          id: string
          name: string
          objective: string
          start_date: string | null
          status: string
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          objective?: string
          start_date?: string | null
          status?: string
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          objective?: string
          start_date?: string | null
          status?: string
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          ad_type: string
          budget: number
          campaign_id: string | null
          clicks: number
          created_at: string
          daily_budget: number
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          impressions: number
          start_date: string | null
          status: string
          target_url: string | null
          title: string
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ad_type?: string
          budget?: number
          campaign_id?: string | null
          clicks?: number
          created_at?: string
          daily_budget?: number
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          start_date?: string | null
          status?: string
          target_url?: string | null
          title: string
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ad_type?: string
          budget?: number
          campaign_id?: string | null
          clicks?: number
          created_at?: string
          daily_budget?: number
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          start_date?: string | null
          status?: string
          target_url?: string | null
          title?: string
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profile_audit_log: {
        Row: {
          accessed_fields: string[] | null
          action: string
          company_profile_id: string
          id: string
          ip_address: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accessed_fields?: string[] | null
          action: string
          company_profile_id: string
          id?: string
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accessed_fields?: string[] | null
          action?: string
          company_profile_id?: string
          id?: string
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          address: string | null
          business_type: string | null
          company_name: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          business_type?: string | null
          company_name: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          business_type?: string | null
          company_name?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_preferences: {
        Row: {
          category_preferences: Json | null
          created_at: string
          dietary_restrictions: string[] | null
          id: string
          last_updated: string
          preferred_price_range: Json | null
          product_ratings: Json | null
          purchase_history: Json | null
          user_id: string
        }
        Insert: {
          category_preferences?: Json | null
          created_at?: string
          dietary_restrictions?: string[] | null
          id?: string
          last_updated?: string
          preferred_price_range?: Json | null
          product_ratings?: Json | null
          purchase_history?: Json | null
          user_id: string
        }
        Update: {
          category_preferences?: Json | null
          created_at?: string
          dietary_restrictions?: string[] | null
          id?: string
          last_updated?: string
          preferred_price_range?: Json | null
          product_ratings?: Json | null
          purchase_history?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      grain_transactions: {
        Row: {
          amount: number
          cash_value: number | null
          created_at: string
          description: string
          id: string
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          cash_value?: number | null
          created_at?: string
          description: string
          id?: string
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          cash_value?: number | null
          created_at?: string
          description?: string
          id?: string
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grain_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          customer_name: string | null
          description: string
          for_marketplace: boolean
          id: string
          is_read: boolean
          order_id: string | null
          product_id: string | null
          product_image: string | null
          product_price: string | null
          timestamp: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          customer_name?: string | null
          description: string
          for_marketplace?: boolean
          id?: string
          is_read?: boolean
          order_id?: string | null
          product_id?: string | null
          product_image?: string | null
          product_price?: string | null
          timestamp?: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          customer_name?: string | null
          description?: string
          for_marketplace?: boolean
          id?: string
          is_read?: boolean
          order_id?: string | null
          product_id?: string | null
          product_image?: string | null
          product_price?: string | null
          timestamp?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          category: string | null
          id: string
          name: string
          order_id: string | null
          price: number
          product_id: number | null
          quantity: number
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
          order_id?: string | null
          price: number
          product_id?: number | null
          quantity?: number
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
          order_id?: string | null
          price?: number
          product_id?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery: string | null
          buyer_id: string | null
          buyer_notes: string | null
          created_at: string | null
          customer_image: string | null
          customer_name: string
          delivery_method: string | null
          expected_delivery: string | null
          from_orders_page: boolean | null
          id: string
          location: string | null
          order_date: string | null
          phone: string | null
          product_id: number | null
          quantity_ordered: number | null
          seller_id: string | null
          seller_notes: string | null
          shipping_address: string | null
          special_request: string | null
          status: string
          store_id: string | null
          timestamp: string | null
          total: number
          unit_price: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_delivery?: string | null
          buyer_id?: string | null
          buyer_notes?: string | null
          created_at?: string | null
          customer_image?: string | null
          customer_name: string
          delivery_method?: string | null
          expected_delivery?: string | null
          from_orders_page?: boolean | null
          id?: string
          location?: string | null
          order_date?: string | null
          phone?: string | null
          product_id?: number | null
          quantity_ordered?: number | null
          seller_id?: string | null
          seller_notes?: string | null
          shipping_address?: string | null
          special_request?: string | null
          status?: string
          store_id?: string | null
          timestamp?: string | null
          total: number
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_delivery?: string | null
          buyer_id?: string | null
          buyer_notes?: string | null
          created_at?: string | null
          customer_image?: string | null
          customer_name?: string
          delivery_method?: string | null
          expected_delivery?: string | null
          from_orders_page?: boolean | null
          id?: string
          location?: string | null
          order_date?: string | null
          phone?: string | null
          product_id?: number | null
          quantity_ordered?: number | null
          seller_id?: string | null
          seller_notes?: string | null
          shipping_address?: string | null
          special_request?: string | null
          status?: string
          store_id?: string | null
          timestamp?: string | null
          total?: number
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          address: string | null
          contact_person: string
          created_at: string
          date_added: string
          email: string
          id: string
          name: string
          phone: string | null
          type: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_person: string
          created_at?: string
          date_added?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          type: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_person?: string
          created_at?: string
          date_added?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_access_log: {
        Row: {
          access_type: string
          id: string
          ip_address: string | null
          store_profile_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          id?: string
          ip_address?: string | null
          store_profile_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          id?: string
          ip_address?: string | null
          store_profile_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pickup_schedules: {
        Row: {
          collections: number
          created_at: string
          day_of_week: number
          enabled: boolean
          end_time: string
          id: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collections?: number
          created_at?: string
          day_of_week: number
          enabled?: boolean
          end_time: string
          id?: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collections?: number
          created_at?: string
          day_of_week?: number
          enabled?: boolean
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pickup_special_dates: {
        Row: {
          collections: number
          created_at: string
          date: string
          enabled: boolean
          end_time: string | null
          id: string
          note: string | null
          start_time: string | null
          user_id: string
        }
        Insert: {
          collections?: number
          created_at?: string
          date: string
          enabled?: boolean
          end_time?: string | null
          id?: string
          note?: string | null
          start_time?: string | null
          user_id: string
        }
        Update: {
          collections?: number
          created_at?: string
          date?: string
          enabled?: boolean
          end_time?: string | null
          id?: string
          note?: string | null
          start_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      point_activities: {
        Row: {
          created_at: string | null
          description: string
          id: string
          points: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          points: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          bbd_end: string | null
          bbd_start: string | null
          brand: string
          category: string
          created_at: string
          description: string
          discount: number
          ean: string | null
          expirationdate: string
          id: number
          image: string
          image_urls: Json | null
          is_marketplace_visible: boolean
          is_surprise_bag: boolean | null
          name: string
          original_price: number | null
          pickup_location: string | null
          pickup_time_end: string | null
          pickup_time_start: string | null
          price: number
          price_per_unit: number | null
          quantity: number
          sku: string | null
          status: string | null
          storeid: string | null
          surprise_bag_contents: string | null
          total_value: number | null
          unit_type: string | null
          userid: string
        }
        Insert: {
          bbd_end?: string | null
          bbd_start?: string | null
          brand?: string
          category?: string
          created_at?: string
          description?: string
          discount?: number
          ean?: string | null
          expirationdate: string
          id?: number
          image?: string
          image_urls?: Json | null
          is_marketplace_visible?: boolean
          is_surprise_bag?: boolean | null
          name: string
          original_price?: number | null
          pickup_location?: string | null
          pickup_time_end?: string | null
          pickup_time_start?: string | null
          price: number
          price_per_unit?: number | null
          quantity?: number
          sku?: string | null
          status?: string | null
          storeid?: string | null
          surprise_bag_contents?: string | null
          total_value?: number | null
          unit_type?: string | null
          userid: string
        }
        Update: {
          bbd_end?: string | null
          bbd_start?: string | null
          brand?: string
          category?: string
          created_at?: string
          description?: string
          discount?: number
          ean?: string | null
          expirationdate?: string
          id?: number
          image?: string
          image_urls?: Json | null
          is_marketplace_visible?: boolean
          is_surprise_bag?: boolean | null
          name?: string
          original_price?: number | null
          pickup_location?: string | null
          pickup_time_end?: string | null
          pickup_time_start?: string | null
          price?: number
          price_per_unit?: number | null
          quantity?: number
          sku?: string | null
          status?: string | null
          storeid?: string | null
          surprise_bag_contents?: string | null
          total_value?: number | null
          unit_type?: string | null
          userid?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          created_at: string | null
          customer_name: string
          id: string
          order_id: string | null
          payment_method: string | null
          products: Json | null
          sale_date: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_name: string
          id?: string
          order_id?: string | null
          payment_method?: string | null
          products?: Json | null
          sale_date?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_name?: string
          id?: string
          order_id?: string | null
          payment_method?: string | null
          products?: Json | null
          sale_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_bag_analytics: {
        Row: {
          created_at: string
          customer_user_id: string | null
          feedback: string | null
          id: string
          personalized_contents: Json
          purchased_at: string | null
          rating: number | null
          smart_bag_id: string | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          customer_user_id?: string | null
          feedback?: string | null
          id?: string
          personalized_contents?: Json
          purchased_at?: string | null
          rating?: number | null
          smart_bag_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          customer_user_id?: string | null
          feedback?: string | null
          id?: string
          personalized_contents?: Json
          purchased_at?: string | null
          rating?: number | null
          smart_bag_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_bag_analytics_smart_bag_id_fkey"
            columns: ["smart_bag_id"]
            isOneToOne: false
            referencedRelation: "smart_bags"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_bags: {
        Row: {
          ai_suggestions: Json | null
          category: string
          created_at: string
          current_quantity: number
          description: string | null
          expires_at: string
          id: string
          is_active: boolean
          max_quantity: number
          name: string
          personalization_enabled: boolean
          sale_price: number
          selected_products: Json
          total_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggestions?: Json | null
          category: string
          created_at?: string
          current_quantity?: number
          description?: string | null
          expires_at: string
          id?: string
          is_active?: boolean
          max_quantity?: number
          name: string
          personalization_enabled?: boolean
          sale_price?: number
          selected_products?: Json
          total_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggestions?: Json | null
          category?: string
          created_at?: string
          current_quantity?: number
          description?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          max_quantity?: number
          name?: string
          personalization_enabled?: boolean
          sale_price?: number
          selected_products?: Json
          total_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_profiles: {
        Row: {
          businessHours: Json
          categories: string[]
          contactEmail: string
          contactPhone: string
          coverUrl: string
          description: string
          id: string
          location: string
          logoUrl: string
          name: string
          payment_details: Json | null
          socialFacebook: string
          socialInstagram: string
          userId: string
        }
        Insert: {
          businessHours?: Json
          categories?: string[]
          contactEmail: string
          contactPhone: string
          coverUrl: string
          description: string
          id?: string
          location: string
          logoUrl: string
          name: string
          payment_details?: Json | null
          socialFacebook: string
          socialInstagram: string
          userId: string
        }
        Update: {
          businessHours?: Json
          categories?: string[]
          contactEmail?: string
          contactPhone?: string
          coverUrl?: string
          description?: string
          id?: string
          location?: string
          logoUrl?: string
          name?: string
          payment_details?: Json | null
          socialFacebook?: string
          socialInstagram?: string
          userId?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string
          closing_hours: string
          created_at: string
          id: string
          image_url: string | null
          logo_url: string | null
          name: string
          opening_hours: string
          store_type: string
          updated_at: string
        }
        Insert: {
          address: string
          closing_hours: string
          created_at?: string
          id?: string
          image_url?: string | null
          logo_url?: string | null
          name: string
          opening_hours: string
          store_type: string
          updated_at?: string
        }
        Update: {
          address?: string
          closing_hours?: string
          created_at?: string
          id?: string
          image_url?: string | null
          logo_url?: string | null
          name?: string
          opening_hours?: string
          store_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_grain_balance: {
        Row: {
          cash_redeemed: number
          id: string
          lifetime_earned: number
          lifetime_redeemed: number
          total_grains: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cash_redeemed?: number
          id?: string
          lifetime_earned?: number
          lifetime_redeemed?: number
          total_grains?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cash_redeemed?: number
          id?: string
          lifetime_earned?: number
          lifetime_redeemed?: number
          total_grains?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string | null
          id: string
          total_points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          total_points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          total_points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      "Wisebite-data": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      wishlist_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          user_id: string
          weekly_budget: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          name: string
          user_id: string
          weekly_budget?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          user_id?: string
          weekly_budget?: number | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          category_id: string
          created_at: string
          id: string
          product_data: Json
          product_id: string
          user_id: string
        }
        Insert: {
          category_id?: string
          created_at?: string
          id?: string
          product_data: Json
          product_id: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          product_data?: Json
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_wishlist_item: {
        Args: {
          p_category_id: string
          p_product_data: Json
          p_product_id: string
          p_user_id: string
        }
        Returns: {
          category_id: string
          created_at: string
          id: string
          product_data: Json
          product_id: string
          user_id: string
        }
      }
      check_wishlist_item: {
        Args: { p_product_id: string; p_user_id: string }
        Returns: {
          category_id: string
          created_at: string
          id: string
          product_data: Json
          product_id: string
          user_id: string
        }[]
      }
      get_ai_product_suggestions: {
        Args: {
          p_category: string
          p_max_suggestions?: number
          p_user_id: string
        }
        Returns: {
          category: string
          days_to_expire: number
          demand_level: string
          id: number
          name: string
          price: number
          priority: string
          quantity: number
          suggestion_reason: string
          wishlist_demand: number
          wishlist_users: Json
        }[]
      }
      get_company_profile_secure: {
        Args: { profile_user_id: string }
        Returns: {
          address: string
          business_type: string
          company_name: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          phone: string
          updated_at: string
          user_id: string
        }[]
      }
      get_pickup_availability: {
        Args: { p_date: string; p_user_id: string }
        Returns: {
          collections: number
          end_time: string
          is_available: boolean
          is_special_date: boolean
          start_time: string
        }[]
      }
      get_wishlist_based_suggestions: {
        Args: {
          p_category?: string
          p_max_suggestions?: number
          p_store_user_id: string
        }
        Returns: {
          category: string
          created_at: string
          days_to_expire: number
          demand_level: string
          id: string
          name: string
          price: number
          priority: string
          quantity: number
          source_type: string
          suggestion_reason: string
          user_id: string
          wishlist_demand: number
          wishlist_users: Json
        }[]
      }
      get_wishlist_by_category: {
        Args: { p_category_id: string; p_user_id: string }
        Returns: {
          category_id: string
          created_at: string
          id: string
          product_data: Json
          product_id: string
          user_id: string
        }[]
      }
      get_wishlist_categories_count: {
        Args: { p_user_id: string }
        Returns: {
          category_id: string
          count: number
        }[]
      }
      log_company_profile_access: {
        Args: {
          p_accessed_fields?: string[]
          p_action: string
          p_company_profile_id: string
        }
        Returns: undefined
      }
      log_payment_access: {
        Args: { access_type: string; profile_id: string }
        Returns: undefined
      }
      mask_payment_details: {
        Args: { payment_data: Json }
        Returns: Json
      }
      remove_wishlist_item: {
        Args: { p_product_id: string; p_user_id: string }
        Returns: boolean
      }
      update_wishlist_category: {
        Args: { p_category_id: string; p_id: string }
        Returns: {
          category_id: string
          created_at: string
          id: string
          product_data: Json
          product_id: string
          user_id: string
        }
      }
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
