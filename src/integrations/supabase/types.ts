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
      action_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          metadata: Json
          module: string
          status: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json
          module: string
          status?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          module?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
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
      autopilot_settings: {
        Row: {
          config: Json
          created_at: string
          execution_frequency: string
          id: string
          is_active: boolean
          last_execution: string | null
          module_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          execution_frequency?: string
          id?: string
          is_active?: boolean
          last_execution?: string | null
          module_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          execution_frequency?: string
          id?: string
          is_active?: boolean
          last_execution?: string | null
          module_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_memory: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
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
      customer_metrics: {
        Row: {
          avg_order_value: number
          conversion_rate: number
          created_at: string | null
          date: string
          id: string
          return_rate: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_order_value?: number
          conversion_rate?: number
          created_at?: string | null
          date: string
          id?: string
          return_rate?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_order_value?: number
          conversion_rate?: number
          created_at?: string | null
          date?: string
          id?: string
          return_rate?: number
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
      deliverect_connections: {
        Row: {
          account_id: string | null
          api_key: string
          auto_sync_enabled: boolean | null
          connection_status: string
          created_at: string
          id: string
          location_id: string
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          account_id?: string | null
          api_key: string
          auto_sync_enabled?: boolean | null
          connection_status?: string
          created_at?: string
          id?: string
          location_id: string
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          account_id?: string | null
          api_key?: string
          auto_sync_enabled?: boolean | null
          connection_status?: string
          created_at?: string
          id?: string
          location_id?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      deliverect_deliveries: {
        Row: {
          assigned_at: string | null
          courier_location: Json | null
          courier_name: string | null
          courier_phone: string | null
          created_at: string
          delivered_at: string | null
          dispatch_status: string
          id: string
          order_id: string | null
          picked_up_at: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          courier_location?: Json | null
          courier_name?: string | null
          courier_phone?: string | null
          created_at?: string
          delivered_at?: string | null
          dispatch_status?: string
          id?: string
          order_id?: string | null
          picked_up_at?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          courier_location?: Json | null
          courier_name?: string | null
          courier_phone?: string | null
          created_at?: string
          delivered_at?: string | null
          dispatch_status?: string
          id?: string
          order_id?: string | null
          picked_up_at?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverect_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "deliverect_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverect_orders: {
        Row: {
          actual_delivery_time: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          deliverect_order_id: string
          delivery_address: string | null
          estimated_delivery_time: string | null
          id: string
          items: Json
          order_status: string
          platform: string
          shipment_id: string | null
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_delivery_time?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          deliverect_order_id: string
          delivery_address?: string | null
          estimated_delivery_time?: string | null
          id?: string
          items?: Json
          order_status?: string
          platform: string
          shipment_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_delivery_time?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          deliverect_order_id?: string
          delivery_address?: string | null
          estimated_delivery_time?: string | null
          id?: string
          items?: Json
          order_status?: string
          platform?: string
          shipment_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverect_orders_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "deliverect_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverect_shipments: {
        Row: {
          connection_id: string | null
          created_at: string
          deliverect_order_id: string | null
          error_message: string | null
          id: string
          platform: string | null
          products: Json
          status: string
          total_items: number
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          deliverect_order_id?: string | null
          error_message?: string | null
          id?: string
          platform?: string | null
          products?: Json
          status?: string
          total_items?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          deliverect_order_id?: string | null
          error_message?: string | null
          id?: string
          platform?: string | null
          products?: Json
          status?: string
          total_items?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverect_shipments_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "deliverect_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      events_calendar: {
        Row: {
          affected_categories: string[] | null
          created_at: string | null
          event_date: string
          event_name: string
          event_type: string
          expected_increase_percent: number | null
          id: string
          impact_level: string
          is_recurring: boolean | null
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          affected_categories?: string[] | null
          created_at?: string | null
          event_date: string
          event_name: string
          event_type: string
          expected_increase_percent?: number | null
          id?: string
          impact_level?: string
          is_recurring?: boolean | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          affected_categories?: string[] | null
          created_at?: string | null
          event_date?: string
          event_name?: string
          event_type?: string
          expected_increase_percent?: number | null
          id?: string
          impact_level?: string
          is_recurring?: boolean | null
          notes?: string | null
          updated_at?: string | null
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
      inventory_snapshots: {
        Row: {
          created_at: string
          id: string
          inventory_data: Json
          item_count: number | null
          pos_connection_id: string
          pos_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_data: Json
          item_count?: number | null
          pos_connection_id: string
          pos_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_data?: Json
          item_count?: number | null
          pos_connection_id?: string
          pos_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_snapshots_pos_connection_id_fkey"
            columns: ["pos_connection_id"]
            isOneToOne: false
            referencedRelation: "pos_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
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
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
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
      pos_connections: {
        Row: {
          api_credentials: Json
          business_name: string
          connection_status: string
          created_at: string
          encrypted_credentials: string | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          pos_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_credentials: Json
          business_name: string
          connection_status?: string
          created_at?: string
          encrypted_credentials?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          pos_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_credentials?: Json
          business_name?: string
          connection_status?: string
          created_at?: string
          encrypted_credentials?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          pos_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pos_integrations: {
        Row: {
          api_endpoint: string
          api_key: string
          created_at: string
          id: string
          is_connected: boolean
          last_sync: string | null
          location_id: string | null
          pos_system: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_endpoint: string
          api_key: string
          created_at?: string
          id?: string
          is_connected?: boolean
          last_sync?: string | null
          location_id?: string | null
          pos_system: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_endpoint?: string
          api_key?: string
          created_at?: string
          id?: string
          is_connected?: boolean
          last_sync?: string | null
          location_id?: string | null
          pos_system?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      predictive_models: {
        Row: {
          accuracy_score: number | null
          created_at: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          last_trained_at: string | null
          model_name: string
          model_type: string
          parameters: Json | null
          training_data_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          last_trained_at?: string | null
          model_name: string
          model_type: string
          parameters?: Json | null
          training_data_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          last_trained_at?: string | null
          model_name?: string
          model_type?: string
          parameters?: Json | null
          training_data_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_price: number
          old_price: number
          product_id: number
          reason: string
          user_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_price: number
          old_price: number
          product_id: number
          reason: string
          user_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_price?: number
          old_price?: number
          product_id?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
          },
        ]
      }
      price_sync_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          new_price: number
          old_price: number
          product_id: number
          sync_attempts: number
          sync_status: string
          synced_at: string | null
          target_system: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          new_price: number
          old_price: number
          product_id: number
          sync_attempts?: number
          sync_status?: string
          synced_at?: string | null
          target_system: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          new_price?: number
          old_price?: number
          product_id?: number
          sync_attempts?: number
          sync_status?: string
          synced_at?: string | null
          target_system?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_sync_queue_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_sync_queue_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          conditions: Json
          created_at: string
          discount_percentage: number
          id: string
          is_active: boolean
          rule_name: string
          rule_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: Json
          created_at?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean
          rule_name: string
          rule_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: Json
          created_at?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean
          rule_name?: string
          rule_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_correlations: {
        Row: {
          confidence: number
          correlation_score: number
          created_at: string | null
          frequency: number
          id: string
          last_calculated_at: string | null
          product_a_id: number | null
          product_a_name: string
          product_b_id: number | null
          product_b_name: string
          user_id: string
        }
        Insert: {
          confidence?: number
          correlation_score: number
          created_at?: string | null
          frequency?: number
          id?: string
          last_calculated_at?: string | null
          product_a_id?: number | null
          product_a_name: string
          product_b_id?: number | null
          product_b_name: string
          user_id: string
        }
        Update: {
          confidence?: number
          correlation_score?: number
          created_at?: string | null
          frequency?: number
          id?: string
          last_calculated_at?: string | null
          product_a_id?: number | null
          product_a_name?: string
          product_b_id?: number | null
          product_b_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_correlations_product_a_id_fkey"
            columns: ["product_a_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_correlations_product_a_id_fkey"
            columns: ["product_a_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_correlations_product_b_id_fkey"
            columns: ["product_b_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_correlations_product_b_id_fkey"
            columns: ["product_b_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_donation_actions: {
        Row: {
          action: string
          created_at: string
          id: string
          organization: string
          product_data: Json | null
          product_id: number
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          organization: string
          product_data?: Json | null
          product_id: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          organization?: string
          product_data?: Json | null
          product_id?: number
          user_id?: string
        }
        Relationships: []
      }
      product_insights: {
        Row: {
          created_at: string | null
          id: number
          insight: Json | null
          insight_type: string | null
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          insight?: Json | null
          insight_type?: string | null
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          insight?: Json | null
          insight_type?: string | null
          product_id?: string | null
        }
        Relationships: []
      }
      product_marketplace_actions: {
        Row: {
          action: string
          created_at: string
          id: string
          marketplace: string
          product_data: Json | null
          product_id: number
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          marketplace: string
          product_data?: Json | null
          product_id: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          marketplace?: string
          product_data?: Json | null
          product_id?: number
          user_id?: string
        }
        Relationships: []
      }
      production_recommendations: {
        Row: {
          applied_at: string | null
          confidence_score: number
          created_at: string
          current_planned_quantity: number
          date: string
          factors: Json
          id: string
          product_id: number
          recommended_quantity: number
          status: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          confidence_score: number
          created_at?: string
          current_planned_quantity?: number
          date: string
          factors?: Json
          id?: string
          product_id: number
          recommended_quantity: number
          status?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          confidence_score?: number
          created_at?: string
          current_planned_quantity?: number
          date?: string
          factors?: Json
          id?: string
          product_id?: number
          recommended_quantity?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          bbd_end: string | null
          bbd_start: string | null
          brand: string
          category: string
          cost: number | null
          created_at: string
          current_price: number | null
          description: string
          discount: number
          ean: string | null
          expirationdate: string
          id: number
          image: string
          image_urls: Json | null
          is_marketplace_visible: boolean
          is_surprise_bag: boolean | null
          last_price_update: string | null
          location_zone: string | null
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
          base_price?: number | null
          bbd_end?: string | null
          bbd_start?: string | null
          brand?: string
          category?: string
          cost?: number | null
          created_at?: string
          current_price?: number | null
          description?: string
          discount?: number
          ean?: string | null
          expirationdate: string
          id?: number
          image?: string
          image_urls?: Json | null
          is_marketplace_visible?: boolean
          is_surprise_bag?: boolean | null
          last_price_update?: string | null
          location_zone?: string | null
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
          base_price?: number | null
          bbd_end?: string | null
          bbd_start?: string | null
          brand?: string
          category?: string
          cost?: number | null
          created_at?: string
          current_price?: number | null
          description?: string
          discount?: number
          ean?: string | null
          expirationdate?: string
          id?: number
          image?: string
          image_urls?: Json | null
          is_marketplace_visible?: boolean
          is_surprise_bag?: boolean | null
          last_price_update?: string | null
          location_zone?: string | null
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
          business_type: string | null
          country: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          business_type?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          business_type?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          channels: Json
          conversion_count: number
          created_at: string
          created_by: string
          discount_percentage: number
          end_time: string
          id: string
          message: string
          product_id: number | null
          promotion_type: string
          sent_count: number
          start_time: string
          status: string
          target_audience: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channels?: Json
          conversion_count?: number
          created_at?: string
          created_by?: string
          discount_percentage: number
          end_time: string
          id?: string
          message: string
          product_id?: number | null
          promotion_type: string
          sent_count?: number
          start_time: string
          status?: string
          target_audience?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channels?: Json
          conversion_count?: number
          created_at?: string
          created_by?: string
          discount_percentage?: number
          end_time?: string
          id?: string
          message?: string
          product_id?: number | null
          promotion_type?: string
          sent_count?: number
          start_time?: string
          status?: string
          target_audience?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approval_required: boolean
          approved_by: string | null
          created_at: string
          created_by: string
          expected_delivery: string | null
          id: string
          items: Json
          order_date: string
          order_number: string
          status: string
          supplier_id: string | null
          supplier_name: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_required?: boolean
          approved_by?: string | null
          created_at?: string
          created_by?: string
          expected_delivery?: string | null
          id?: string
          items?: Json
          order_date?: string
          order_number: string
          status?: string
          supplier_id?: string | null
          supplier_name: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_required?: boolean
          approved_by?: string | null
          created_at?: string
          created_by?: string
          expected_delivery?: string | null
          id?: string
          items?: Json
          order_date?: string
          order_number?: string
          status?: string
          supplier_id?: string | null
          supplier_name?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      reorder_rules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_order_date: string | null
          lead_time_days: number
          min_stock_level: number
          product_id: number
          reorder_quantity: number
          supplier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_order_date?: string | null
          lead_time_days?: number
          min_stock_level: number
          product_id: number
          reorder_quantity: number
          supplier_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_order_date?: string | null
          lead_time_days?: number
          min_stock_level?: number
          product_id?: number
          reorder_quantity?: number
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reorder_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reorder_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "reorder_rules_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
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
      sales_history: {
        Row: {
          category: string
          created_at: string | null
          day_of_week: number
          hour_of_day: number
          id: string
          product_id: number | null
          product_name: string
          quantity: number
          sale_date: string
          temperature: number | null
          total_amount: number
          unit_price: number
          user_id: string
          weather_condition: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          day_of_week: number
          hour_of_day: number
          id?: string
          product_id?: number | null
          product_name: string
          quantity?: number
          sale_date: string
          temperature?: number | null
          total_amount?: number
          unit_price?: number
          user_id: string
          weather_condition?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          day_of_week?: number
          hour_of_day?: number
          id?: string
          product_id?: number | null
          product_name?: string
          quantity?: number
          sale_date?: string
          temperature?: number | null
          total_amount?: number
          unit_price?: number
          user_id?: string
          weather_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
          },
        ]
      }
      sales_metrics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          profit: number
          total_sales: number
          transactions: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          profit?: number
          total_sales?: number
          transactions?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          profit?: number
          total_sales?: number
          transactions?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales_predictions: {
        Row: {
          confidence_score: number
          created_at: string | null
          factors: Json | null
          id: string
          model_id: string | null
          predicted_quantity: number
          predicted_revenue: number
          prediction_date: string
          product_id: number | null
          product_name: string
          user_id: string
        }
        Insert: {
          confidence_score: number
          created_at?: string | null
          factors?: Json | null
          id?: string
          model_id?: string | null
          predicted_quantity: number
          predicted_revenue: number
          prediction_date: string
          product_id?: number | null
          product_name: string
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string | null
          factors?: Json | null
          id?: string
          model_id?: string | null
          predicted_quantity?: number
          predicted_revenue?: number
          prediction_date?: string
          product_id?: number | null
          product_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_predictions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "predictive_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_predictions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_predictions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
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
      square_connections: {
        Row: {
          access_token: string
          application_id: string
          auto_sync_enabled: boolean | null
          connection_status: string
          created_at: string | null
          id: string
          last_tested_at: string | null
          location_id: string
          location_name: string | null
          updated_at: string | null
          user_id: string
          webhook_enabled: boolean | null
          webhook_url: string | null
        }
        Insert: {
          access_token: string
          application_id: string
          auto_sync_enabled?: boolean | null
          connection_status?: string
          created_at?: string | null
          id?: string
          last_tested_at?: string | null
          location_id: string
          location_name?: string | null
          updated_at?: string | null
          user_id: string
          webhook_enabled?: boolean | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string
          application_id?: string
          auto_sync_enabled?: boolean | null
          connection_status?: string
          created_at?: string | null
          id?: string
          last_tested_at?: string | null
          location_id?: string
          location_name?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_enabled?: boolean | null
          webhook_url?: string | null
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
      surprise_bags_metrics: {
        Row: {
          created_at: string | null
          discount_price: number
          id: string
          items: Json
          original_price: number
          pickup_time: string | null
          status: string
          store_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discount_price: number
          id?: string
          items?: Json
          original_price: number
          pickup_time?: string | null
          status?: string
          store_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discount_price?: number
          id?: string
          items?: Json
          original_price?: number
          pickup_time?: string | null
          status?: string
          store_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sustainability_metrics: {
        Row: {
          co2_saved: number
          created_at: string | null
          date: string
          food_waste_kg: number
          id: string
          updated_at: string | null
          user_id: string
          waste_reduced: number
        }
        Insert: {
          co2_saved?: number
          created_at?: string | null
          date: string
          food_waste_kg?: number
          id?: string
          updated_at?: string | null
          user_id: string
          waste_reduced?: number
        }
        Update: {
          co2_saved?: number
          created_at?: string | null
          date?: string
          food_waste_kg?: number
          id?: string
          updated_at?: string | null
          user_id?: string
          waste_reduced?: number
        }
        Relationships: []
      }
      uploaded_data: {
        Row: {
          business_name: string | null
          business_type: string | null
          created_at: string
          csv_files: Json | null
          google_sheet_url: string | null
          id: string
          json_data: Json | null
          manual_data: string | null
          pdf_info: Json | null
          user_id: string
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          csv_files?: Json | null
          google_sheet_url?: string | null
          id?: string
          json_data?: Json | null
          manual_data?: string | null
          pdf_info?: Json | null
          user_id: string
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          csv_files?: Json | null
          google_sheet_url?: string | null
          id?: string
          json_data?: Json | null
          manual_data?: string | null
          pdf_info?: Json | null
          user_id?: string
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
      waste_predictions: {
        Row: {
          confidence_score: number
          created_at: string | null
          id: string
          predicted_waste_quantity: number
          predicted_waste_value: number
          prediction_date: string
          product_id: number | null
          product_name: string
          recommendation: string | null
          user_id: string
          waste_cause: string
        }
        Insert: {
          confidence_score: number
          created_at?: string | null
          id?: string
          predicted_waste_quantity: number
          predicted_waste_value: number
          prediction_date: string
          product_id?: number | null
          product_name: string
          recommendation?: string | null
          user_id: string
          waste_cause: string
        }
        Update: {
          confidence_score?: number
          created_at?: string | null
          id?: string
          predicted_waste_quantity?: number
          predicted_waste_value?: number
          prediction_date?: string
          product_id?: number | null
          product_name?: string
          recommendation?: string | null
          user_id?: string
          waste_cause?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_predictions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_predictions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sales_analytics"
            referencedColumns: ["product_id"]
          },
        ]
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
      zone_multipliers: {
        Row: {
          created_at: string
          demand_level: string
          id: string
          price_multiplier: number
          updated_at: string
          user_id: string
          zone_code: string
          zone_name: string
        }
        Insert: {
          created_at?: string
          demand_level: string
          id?: string
          price_multiplier?: number
          updated_at?: string
          user_id: string
          zone_code: string
          zone_name: string
        }
        Update: {
          created_at?: string
          demand_level?: string
          id?: string
          price_multiplier?: number
          updated_at?: string
          user_id?: string
          zone_code?: string
          zone_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      sales_analytics: {
        Row: {
          avg_selling_price: number | null
          brand: string | null
          category: string | null
          current_price: number | null
          current_stock: number | null
          days_since_last_sale: number | null
          last_sale_date: string | null
          original_price: number | null
          performance_category: string | null
          product_id: number | null
          product_name: string | null
          stock_status: string | null
          total_orders: number | null
          total_quantity_sold: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
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
        SetofOptions: {
          from: "*"
          to: "wishlists"
          isOneToOne: true
          isSetofReturn: false
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
        SetofOptions: {
          from: "*"
          to: "wishlists"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      decrypt_pos_credentials: {
        Args: { encrypted_data: string }
        Returns: Json
      }
      encrypt_pos_credentials: {
        Args: { credentials_json: Json }
        Returns: string
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
      get_user_sales_analytics: {
        Args: never
        Returns: {
          avg_selling_price: number
          brand: string
          category: string
          current_price: number
          current_stock: number
          days_since_last_sale: number
          last_sale_date: string
          original_price: number
          performance_category: string
          product_id: number
          product_name: string
          stock_status: string
          total_orders: number
          total_quantity_sold: number
          total_revenue: number
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
        SetofOptions: {
          from: "*"
          to: "wishlists"
          isOneToOne: false
          isSetofReturn: true
        }
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
      mask_payment_details: { Args: { payment_data: Json }; Returns: Json }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
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
        SetofOptions: {
          from: "*"
          to: "wishlists"
          isOneToOne: true
          isSetofReturn: false
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
