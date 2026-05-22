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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      balance_transactions: {
        Row: {
          admin_note: string | null
          amount: number
          balance_after: number
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url: string | null
          related_order_id: string | null
          status: Database["public"]["Enums"]["balance_tx_status"]
          type: Database["public"]["Enums"]["balance_tx_type"]
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url?: string | null
          related_order_id?: string | null
          status?: Database["public"]["Enums"]["balance_tx_status"]
          type: Database["public"]["Enums"]["balance_tx_type"]
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url?: string | null
          related_order_id?: string | null
          status?: Database["public"]["Enums"]["balance_tx_status"]
          type?: Database["public"]["Enums"]["balance_tx_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_transactions_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "balance_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number
          min_order_usd: number
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          min_order_usd?: number
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          min_order_usd?: number
        }
        Relationships: []
      }
      gift_links: {
        Row: {
          id: string
          created_at: string
          created_by: string
          reward_url: string
          details: string | null
          is_used: boolean
          used_by: string | null
          used_at: string | null
          plan_id: string | null
          plan_inventory_id: string | null
          saved_by: string | null
          saved_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          created_by: string
          reward_url: string
          details?: string | null
          is_used?: boolean
          used_by?: string | null
          used_at?: string | null
          plan_id?: string | null
          plan_inventory_id?: string | null
          saved_by?: string | null
          saved_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          created_by?: string
          reward_url?: string
          details?: string | null
          is_used?: boolean
          used_by?: string | null
          used_at?: string | null
          plan_id?: string | null
          plan_inventory_id?: string | null
          saved_by?: string | null
          saved_at?: string | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          currency_code: string
          rate_to_usd: number
          label: string | null
          symbol: string | null
          updated_at: string
        }
        Insert: {
          currency_code: string
          rate_to_usd: number
          label?: string | null
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          currency_code?: string
          rate_to_usd?: number
          label?: string | null
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message_ar: string
          message_en: string
          title_ar: string
          title_en: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message_ar: string
          message_en: string
          title_ar: string
          title_en: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message_ar?: string
          message_en?: string
          title_ar?: string
          title_en?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          delivery_data: Json | null
          delivery_status: Database["public"]["Enums"]["delivery_item_status"]
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          id: string
          order_id: string
          plan_id: string
          quantity: number
          unit_price_usd: number
          user_provided_email: string | null
        }
        Insert: {
          created_at?: string
          delivery_data?: Json | null
          delivery_status?: Database["public"]["Enums"]["delivery_item_status"]
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          id?: string
          order_id: string
          plan_id: string
          quantity?: number
          unit_price_usd: number
          user_provided_email?: string | null
        }
        Update: {
          created_at?: string
          delivery_data?: Json | null
          delivery_status?: Database["public"]["Enums"]["delivery_item_status"]
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          id?: string
          order_id?: string
          plan_id?: string
          quantity?: number
          unit_price_usd?: number
          user_provided_email?: string | null
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
            foreignKeyName: "order_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_proof_url: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          status: Database["public"]["Enums"]["order_status"]
          total_usd: number
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["order_status"]
          total_usd: number
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_proof_url?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["order_status"]
          total_usd?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          id: string
          payment_method: string
          is_enabled: boolean
          display_name_en: string
          display_name_ar: string
          account_number: string | null
          account_name: string | null
          wallet_address: string | null
          network: string | null
          instructions_en: string | null
          instructions_ar: string | null
          admin_note_en: string | null
          admin_note_ar: string | null
          qr_code_url: string | null
          extra_info: Record<string, unknown> | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          payment_method: string
          is_enabled?: boolean
          display_name_en?: string
          display_name_ar?: string
          account_number?: string | null
          account_name?: string | null
          wallet_address?: string | null
          network?: string | null
          instructions_en?: string | null
          instructions_ar?: string | null
          admin_note_en?: string | null
          admin_note_ar?: string | null
          qr_code_url?: string | null
          extra_info?: Record<string, unknown> | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          payment_method?: string
          is_enabled?: boolean
          display_name_en?: string
          display_name_ar?: string
          account_number?: string | null
          account_name?: string | null
          wallet_address?: string | null
          network?: string | null
          instructions_en?: string | null
          instructions_ar?: string | null
          admin_note_en?: string | null
          admin_note_ar?: string | null
          qr_code_url?: string | null
          extra_info?: Record<string, unknown> | null
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      plan_inventory: {
        Row: {
          account_email: string | null
          account_password: string | null
          backup_email: string | null
          backup_password: string | null
          two_fa_secret: string | null
          created_at: string | null
          id: string
          invite_link: string | null
          order_item_id: string | null
          plan_id: string | null
          sold_at: string | null
          sold_to_user_id: string | null
          status: string | null
          used_at: string | null
        }
        Insert: {
          account_email?: string | null
          account_password?: string | null
          backup_email?: string | null
          backup_password?: string | null
          two_fa_secret?: string | null
          created_at?: string | null
          id?: string
          invite_link?: string | null
          order_item_id?: string | null
          plan_id?: string | null
          sold_at?: string | null
          sold_to_user_id?: string | null
          status?: string | null
          used_at?: string | null
        }
        Update: {
          account_email?: string | null
          account_password?: string | null
          backup_email?: string | null
          backup_password?: string | null
          two_fa_secret?: string | null
          created_at?: string | null
          id?: string
          invite_link?: string | null
          order_item_id?: string | null
          plan_id?: string | null
          sold_at?: string | null
          sold_to_user_id?: string | null
          status?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_inventory_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_inventory_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          delivery_data: Json | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          discount_label: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean
          is_highlighted: boolean
          max_accounts: number
          original_price_usd: number | null
          store_original_price_usd: number | null
          price_usd: number
          product_id: string
          sort_order: number
          stock_count: number | null
          title_ar: string
          title_en: string
          mini_card_url: string | null
          custom_activation_ar: string | null
          custom_activation_en: string | null
          custom_details_ar: string | null
          custom_details_en: string | null
          custom_policies_ar: string | null
          custom_policies_en: string | null
          units_sold: number
        }
        Insert: {
          created_at?: string
          delivery_data?: Json | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          discount_label?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          max_accounts?: number
          original_price_usd?: number | null
          store_original_price_usd?: number | null
          price_usd: number
          product_id: string
          sort_order?: number
          stock_count?: number | null
          title_ar: string
          title_en: string
          mini_card_url?: string | null
          custom_activation_ar?: string | null
          custom_activation_en?: string | null
          custom_details_ar?: string | null
          custom_details_en?: string | null
          custom_policies_ar?: string | null
          custom_policies_en?: string | null
          units_sold?: number
        }
        Update: {
          created_at?: string
          delivery_data?: Json | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          discount_label?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          max_accounts?: number
          original_price_usd?: number | null
          store_original_price_usd?: number | null
          price_usd?: number
          product_id?: string
          sort_order?: number
          stock_count?: number | null
          title_ar?: string
          title_en?: string
          mini_card_url?: string | null
          custom_activation_ar?: string | null
          custom_activation_en?: string | null
          custom_details_ar?: string | null
          custom_details_en?: string | null
          custom_policies_ar?: string | null
          custom_policies_en?: string | null
          units_sold?: number
        }
        Relationships: [
          {
            foreignKeyName: "plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_code?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_invite_link: {
        Args: {
          p_inventory_id: string
        }
        Returns: void
      }
      allocate_inventory_for_order: {
        Args: {
          p_order_id: string
        }
        Returns: void
      }
      deallocate_inventory_for_order: {
        Args: {
          p_order_id: string
        }
        Returns: void
      }
      finalize_order_delivery: {
        Args: {
          p_order_id: string
        }
        Returns: void
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_user_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      update_plan_stock: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      update_user_balance: {
        Args: {
          p_admin_note?: string
          p_amount: number
          p_payment_method?: Database["public"]["Enums"]["payment_method"]
          p_payment_proof_url?: string
          p_related_order_id?: string
          p_type: Database["public"]["Enums"]["balance_tx_type"]
          p_user_id: string
        }
        Returns: {
          admin_note: string | null
          amount: number
          balance_after: number
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_proof_url: string | null
          related_order_id: string | null
          status: Database["public"]["Enums"]["balance_tx_status"]
          type: Database["public"]["Enums"]["balance_tx_type"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "balance_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_gift_link: {
        Args: {
          p_gift_link_id: string
          p_user_id: string
        }
        Returns: {
          reward_url: string
        }[]
      }
      save_gift_link: {
        Args: {
          p_gift_link_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      generate_service_gift_link: {
        Args: {
          p_plan_id: string
          p_invite_link: string
          p_details: string | null
          p_admin_id: string
        }
        Returns: string
      }
    }
    Enums: {
      balance_tx_status: "pending" | "confirmed" | "rejected"
      balance_tx_type: "topup" | "purchase" | "refund" | "admin_adjust"
      delivery_item_status: "pending" | "delivered"
      delivery_type: "ready_account" | "invitation_link" | "user_provides_email"
      discount_type: "percentage" | "fixed"
      notification_type: "order" | "balance" | "system" | "promo"
      order_status:
        | "pending_payment"
        | "payment_review"
        | "processing"
        | "delivered"
        | "partially_delivered"
        | "cancelled"
        | "refunded"
      payment_method: "vodafone" | "crypto" | "balance"
      payment_status: "pending" | "confirmed" | "rejected"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      user_role: "user" | "admin" | "super_admin"
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
      balance_tx_status: ["pending", "confirmed", "rejected"],
      balance_tx_type: ["topup", "purchase", "refund", "admin_adjust"],
      delivery_item_status: ["pending", "delivered"],
      delivery_type: [
        "ready_account",
        "invitation_link",
        "user_provides_email",
      ],
      discount_type: ["percentage", "fixed"],
      notification_type: ["order", "balance", "system", "promo"],
      order_status: [
        "pending_payment",
        "payment_review",
        "processing",
        "delivered",
        "partially_delivered",
        "cancelled",
        "refunded",
      ],
      payment_method: ["vodafone", "crypto", "balance"],
      payment_status: ["pending", "confirmed", "rejected"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      user_role: ["user", "admin", "super_admin"],
    },
  },
} as const
