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
      clients: {
        Row: {
          address: string | null
          city: string | null
          complement: string | null
          created_at: string | null
          document: string | null
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          number: string | null
          phone: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string | null
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      commercial_accounts: {
        Row: {
          bank_code: string | null
          color: string | null
          created_at: string | null
          current_balance: number | null
          id: string
          initial_balance: number | null
          name: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_code?: string | null
          color?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          name: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_code?: string | null
          color?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          name?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string
          id: string
          is_paid: boolean | null
          notes: string | null
          paid_date: string | null
          recurrence: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          recurrence?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          paid_date?: string | null
          recurrence?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_operational: boolean | null
          name: string
          parent_id: string | null
          scope: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_operational?: boolean | null
          name: string
          parent_id?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_operational?: boolean | null
          name?: string
          parent_id?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string | null
          created_at: string | null
          description: string
          id: string
          is_deleted: boolean | null
          payment_method: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          transaction_date: string | null
          type: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_deleted?: boolean | null
          payment_method?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_date?: string | null
          type: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_deleted?: boolean | null
          payment_method?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          transaction_date?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "commercial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_billing: {
        Row: {
          billing_amount: number
          created_at: string | null
          id: string
          month: number
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          billing_amount?: number
          created_at?: string | null
          id?: string
          month: number
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          billing_amount?: number
          created_at?: string | null
          id?: string
          month?: number
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      monthly_expenses: {
        Row: {
          created_at: string | null
          description: string
          id: string
          monthly_billing_id: string
          operational_cost_id: string | null
          source: string
          type: string
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          monthly_billing_id: string
          operational_cost_id?: string | null
          source: string
          type: string
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          monthly_billing_id?: string
          operational_cost_id?: string | null
          source?: string
          type?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_expenses_monthly_billing_id_fkey"
            columns: ["monthly_billing_id"]
            isOneToOne: false
            referencedRelation: "monthly_billing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_expenses_operational_cost_id_fkey"
            columns: ["operational_cost_id"]
            isOneToOne: false
            referencedRelation: "operational_costs"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_cost_payments: {
        Row: {
          amount_original: number
          amount_paid: number | null
          created_at: string | null
          description: string
          due_date: string
          fine_amount: number | null
          id: string
          interest_amount: number | null
          operational_cost_id: string | null
          payment_date: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_original?: number
          amount_paid?: number | null
          created_at?: string | null
          description: string
          due_date: string
          fine_amount?: number | null
          id?: string
          interest_amount?: number | null
          operational_cost_id?: string | null
          payment_date?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_original?: number
          amount_paid?: number | null
          created_at?: string | null
          description?: string
          due_date?: string
          fine_amount?: number | null
          id?: string
          interest_amount?: number | null
          operational_cost_id?: string | null
          payment_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_cost_payments_operational_cost_id_fkey"
            columns: ["operational_cost_id"]
            isOneToOne: false
            referencedRelation: "operational_costs"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_costs: {
        Row: {
          accrual_date: string | null
          category: string | null
          created_at: string | null
          description: string
          due_date: string | null
          expense_date: string | null
          id: string
          installment_number: number | null
          installments_total: number | null
          is_recurring: boolean | null
          issue_date: string | null
          observation: string | null
          recurrence_end_date: string | null
          recurrence_frequency: string | null
          recurrence_group_id: string | null
          status: string | null
          type: string
          user_id: string
          value: number
        }
        Insert: {
          accrual_date?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          due_date?: string | null
          expense_date?: string | null
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          is_recurring?: boolean | null
          issue_date?: string | null
          observation?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          recurrence_group_id?: string | null
          status?: string | null
          type: string
          user_id: string
          value: number
        }
        Update: {
          accrual_date?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          due_date?: string | null
          expense_date?: string | null
          id?: string
          installment_number?: number | null
          installments_total?: number | null
          is_recurring?: boolean | null
          issue_date?: string | null
          observation?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          recurrence_group_id?: string | null
          status?: string | null
          type?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      operational_hours: {
        Row: {
          created_at: string | null
          friday_end: string | null
          friday_start: string | null
          id: string
          monday_end: string | null
          monday_start: string | null
          saturday_end: string | null
          saturday_start: string | null
          sunday_end: string | null
          sunday_start: string | null
          thursday_end: string | null
          thursday_start: string | null
          tuesday_end: string | null
          tuesday_start: string | null
          user_id: string
          wednesday_end: string | null
          wednesday_start: string | null
        }
        Insert: {
          created_at?: string | null
          friday_end?: string | null
          friday_start?: string | null
          id?: string
          monday_end?: string | null
          monday_start?: string | null
          saturday_end?: string | null
          saturday_start?: string | null
          sunday_end?: string | null
          sunday_start?: string | null
          thursday_end?: string | null
          thursday_start?: string | null
          tuesday_end?: string | null
          tuesday_start?: string | null
          user_id: string
          wednesday_end?: string | null
          wednesday_start?: string | null
        }
        Update: {
          created_at?: string | null
          friday_end?: string | null
          friday_start?: string | null
          id?: string
          monday_end?: string | null
          monday_start?: string | null
          saturday_end?: string | null
          saturday_start?: string | null
          sunday_end?: string | null
          sunday_start?: string | null
          thursday_end?: string | null
          thursday_start?: string | null
          tuesday_end?: string | null
          tuesday_start?: string | null
          user_id?: string
          wednesday_end?: string | null
          wednesday_start?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          code: string | null
          container_size_ml: number | null
          created_at: string | null
          description: string | null
          dilution: string | null
          dilution_ratio: string | null
          id: string
          image_url: string | null
          is_dilutable: boolean | null
          is_for_sale: boolean | null
          name: string
          price: number | null
          sale_price: number | null
          size: string | null
          stock_quantity: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code?: string | null
          container_size_ml?: number | null
          created_at?: string | null
          description?: string | null
          dilution?: string | null
          dilution_ratio?: string | null
          id?: string
          image_url?: string | null
          is_dilutable?: boolean | null
          is_for_sale?: boolean | null
          name: string
          price?: number | null
          sale_price?: number | null
          size?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code?: string | null
          container_size_ml?: number | null
          created_at?: string | null
          description?: string | null
          dilution?: string | null
          dilution_ratio?: string | null
          id?: string
          image_url?: string | null
          is_dilutable?: boolean | null
          is_for_sale?: boolean | null
          name?: string
          price?: number | null
          sale_price?: number | null
          size?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          address_number: string | null
          avatar_url: string | null
          company_address: string | null
          company_colors: Json | null
          company_complement: string | null
          company_document: string | null
          company_logo_url: string | null
          company_name: string | null
          company_number: string | null
          company_phone: string | null
          company_zip_code: string | null
          cpf_cnpj: string | null
          created_at: string | null
          document_number: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          include_investment: boolean | null
          include_working_capital: boolean | null
          initial_investment: number | null
          instagram: string | null
          investment_return_months: number | null
          kiwify_subscription_id: string | null
          last_name: string | null
          mobile_phone: string | null
          nickname: string | null
          phone_number: string | null
          residential_complement: string | null
          shop_name: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string | null
          website: string | null
          working_capital_goal: number | null
          working_capital_months: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_number?: string | null
          avatar_url?: string | null
          company_address?: string | null
          company_colors?: Json | null
          company_complement?: string | null
          company_document?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_number?: string | null
          company_phone?: string | null
          company_zip_code?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          document_number?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          include_investment?: boolean | null
          include_working_capital?: boolean | null
          initial_investment?: number | null
          instagram?: string | null
          investment_return_months?: number | null
          kiwify_subscription_id?: string | null
          last_name?: string | null
          mobile_phone?: string | null
          nickname?: string | null
          phone_number?: string | null
          residential_complement?: string | null
          shop_name?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
          working_capital_goal?: number | null
          working_capital_months?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_number?: string | null
          avatar_url?: string | null
          company_address?: string | null
          company_colors?: Json | null
          company_complement?: string | null
          company_document?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_number?: string | null
          company_phone?: string | null
          company_zip_code?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          document_number?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          include_investment?: boolean | null
          include_working_capital?: boolean | null
          initial_investment?: number | null
          instagram?: string | null
          investment_return_months?: number | null
          kiwify_subscription_id?: string | null
          last_name?: string | null
          mobile_phone?: string | null
          nickname?: string | null
          phone_number?: string | null
          residential_complement?: string | null
          shop_name?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
          working_capital_goal?: number | null
          working_capital_months?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      service_order_items: {
        Row: {
          created_at: string | null
          id: string
          quantity: number | null
          service_id: string | null
          service_order_id: string
          title: string
          unit_price: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          quantity?: number | null
          service_id?: string | null
          service_order_id: string
          title: string
          unit_price: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          quantity?: number | null
          service_id?: string | null
          service_order_id?: string
          title?: string
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_items_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          client_id: string | null
          created_at: string | null
          date_in: string | null
          date_out: string | null
          discount: number | null
          final_amount: number | null
          id: string
          notes: string | null
          sale_number: string | null
          status: string
          total_amount: number | null
          updated_at: string | null
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          date_in?: string | null
          date_out?: string | null
          discount?: number | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          sale_number?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          date_in?: string | null
          date_out?: string | null
          discount?: number | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          sale_number?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_products: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          service_id: string
          user_id?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_products_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean | null
          base_price: number
          category: string | null
          commission_percent: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          icon: string | null
          id: string
          labor_cost_per_hour: number | null
          name: string
          other_costs: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          base_price?: number
          category?: string | null
          commission_percent?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          labor_cost_per_hour?: number | null
          name: string
          other_costs?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          base_price?: number
          category?: string | null
          commission_percent?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          labor_cost_per_hour?: number | null
          name?: string
          other_costs?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string | null
          client_id: string
          color: string | null
          created_at: string | null
          id: string
          license_plate: string | null
          model: string | null
          notes: string | null
          plate: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          year: string | null
        }
        Insert: {
          brand?: string | null
          client_id: string
          color?: string | null
          created_at?: string | null
          id?: string
          license_plate?: string | null
          model?: string | null
          notes?: string | null
          plate?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          year?: string | null
        }
        Update: {
          brand?: string | null
          client_id?: string
          color?: string | null
          created_at?: string | null
          id?: string
          license_plate?: string | null
          model?: string | null
          notes?: string | null
          plate?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      seed_financial_categories: {
        Args: { target_user_id: string }
        Returns: undefined
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
