export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          description: string
          for_marketplace: boolean
          id: string
          is_read: boolean
          order_id: string | null
          timestamp: string
          title: string
          type: string
        }
        Insert: {
          description: string
          for_marketplace?: boolean
          id?: string
          is_read?: boolean
          order_id?: string | null
          timestamp?: string
          title: string
          type: string
        }
        Update: {
          description?: string
          for_marketplace?: boolean
          id?: string
          is_read?: boolean
          order_id?: string | null
          timestamp?: string
          title?: string
          type?: string
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
          created_at: string | null
          customer_image: string | null
          customer_name: string
          from_orders_page: boolean | null
          id: string
          location: string | null
          phone: string | null
          special_request: string | null
          status: string
          store_id: string | null
          timestamp: string | null
          total: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_image?: string | null
          customer_name: string
          from_orders_page?: boolean | null
          id?: string
          location?: string | null
          phone?: string | null
          special_request?: string | null
          status?: string
          store_id?: string | null
          timestamp?: string | null
          total: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_image?: string | null
          customer_name?: string
          from_orders_page?: boolean | null
          id?: string
          location?: string | null
          phone?: string | null
          special_request?: string | null
          status?: string
          store_id?: string | null
          timestamp?: string | null
          total?: number
          updated_at?: string | null
          user_id?: string | null
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
          brand: string
          category: string
          created_at: string
          description: string
          discount: number
          expirationdate: string
          id: number
          image: string
          name: string
          price: number
          quantity: number
          storeid: string | null
          userid: string
        }
        Insert: {
          brand: string
          category: string
          created_at?: string
          description: string
          discount?: number
          expirationdate: string
          id?: number
          image?: string
          name: string
          price: number
          quantity?: number
          storeid?: string | null
          userid: string
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          description?: string
          discount?: number
          expirationdate?: string
          id?: number
          image?: string
          name?: string
          price?: number
          quantity?: number
          storeid?: string | null
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
          p_product_id: string
          p_user_id: string
          p_category_id: string
          p_product_data: Json
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
      remove_wishlist_item: {
        Args: { p_product_id: string; p_user_id: string }
        Returns: boolean
      }
      update_wishlist_category: {
        Args: { p_id: string; p_category_id: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
