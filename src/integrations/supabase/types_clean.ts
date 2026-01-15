export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          document: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          document?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          document?: string | null;
          created_at?: string | null;
        };
      };
      commercial_accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string | null;
          bank_code: string | null;
          initial_balance: string | null;
          current_balance: string | null;
          color: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string | null;
          bank_code?: string | null;
          initial_balance?: string | null;
          current_balance?: string | null;
          color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string | null;
          bank_code?: string | null;
          initial_balance?: string | null;
          current_balance?: string | null;
          color?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string | null;
          amount: string;
          date: string;
          is_paid: boolean | null;
          paid_date: string | null;
          recurrence: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category?: string | null;
          amount: string;
          date: string;
          is_paid?: boolean | null;
          paid_date?: string | null;
          recurrence?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          category?: string | null;
          amount?: string;
          date?: string;
          is_paid?: boolean | null;
          paid_date?: string | null;
          recurrence?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      financial_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string | null;
          created_at?: string | null;
        };
      };
      financial_transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string | null;
          amount: string;
          type: string;
          description: string;
          category: string | null;
          transaction_date: string | null;
          related_entity_type: string | null;
          related_entity_id: string | null;
          created_at: string | null;
          payment_method: string | null;
          is_deleted: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id?: string | null;
          amount: string;
          type: string;
          description: string;
          category?: string | null;
          transaction_date?: string | null;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          created_at?: string | null;
          payment_method?: string | null;
          is_deleted?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string | null;
          amount?: string;
          type?: string;
          description?: string;
          category?: string | null;
          transaction_date?: string | null;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          created_at?: string | null;
          payment_method?: string | null;
          is_deleted?: boolean | null;
        };
      };
      monthly_billing: {
        Row: {
          id: string;
          user_id: string;
          month: number;
          year: number;
          billing_amount: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: number;
          year: number;
          billing_amount: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: number;
          year?: number;
          billing_amount?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      monthly_expenses: {
        Row: {
          id: string;
          monthly_billing_id: string;
          operational_cost_id: string | null;
          description: string;
          value: string;
          type: string;
          source: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          monthly_billing_id: string;
          operational_cost_id?: string | null;
          description: string;
          value: string;
          type: string;
          source: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          monthly_billing_id?: string;
          operational_cost_id?: string | null;
          description?: string;
          value?: string;
          type?: string;
          source?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      operational_cost_payments: {
        Row: {
          id: string;
          user_id: string;
          operational_cost_id: string;
          amount: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          operational_cost_id: string;
          amount: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          operational_cost_id?: string;
          amount?: string;
          created_at?: string | null;
        };
      };
      operational_costs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          value: string;
          recurrence: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          value: string;
          recurrence?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          value?: string;
          recurrence?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      operational_hours: {
        Row: {
          id: string;
          user_id: string;
          monday_start: string | null;
          monday_end: string | null;
          tuesday_start: string | null;
          tuesday_end: string | null;
          wednesday_start: string | null;
          wednesday_end: string | null;
          thursday_start: string | null;
          thursday_end: string | null;
          friday_start: string | null;
          friday_end: string | null;
          saturday_start: string | null;
          saturday_end: string | null;
          sunday_start: string | null;
          sunday_end: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          monday_start?: string | null;
          monday_end?: string | null;
          tuesday_start?: string | null;
          tuesday_end?: string | null;
          wednesday_start?: string | null;
          wednesday_end?: string | null;
          thursday_start?: string | null;
          thursday_end?: string | null;
          friday_start?: string | null;
          friday_end?: string | null;
          saturday_start?: string | null;
          saturday_end?: string | null;
          sunday_start?: string | null;
          sunday_end?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          monday_start?: string | null;
          monday_end?: string | null;
          tuesday_start?: string | null;
          tuesday_end?: string | null;
          wednesday_start?: string | null;
          wednesday_end?: string | null;
          thursday_start?: string | null;
          thursday_end?: string | null;
          friday_start?: string | null;
          friday_end?: string | null;
          saturday_start?: string | null;
          saturday_end?: string | null;
          sunday_start?: string | null;
          sunday_end?: string | null;
          created_at?: string | null;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean | null;
          created_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          price: string;
          stock: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          price: string;
          stock?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          price?: string;
          stock?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
          created_at?: string | null;
        };
      };
      service_order_items: {
        Row: {
          id: string;
          user_id: string;
          service_order_id: string;
          service_id: string | null;
          title: string;
          unit_price: string;
          quantity: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_order_id: string;
          service_id?: string | null;
          title: string;
          unit_price: string;
          quantity?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_order_id?: string;
          service_id?: string | null;
          title?: string;
          unit_price?: string;
          quantity?: string | null;
          created_at?: string | null;
        };
      };
      service_orders: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          vehicle_id: string | null;
          status: string;
          sale_number: string | null;
          total_amount: string | null;
          discount: string | null;
          final_amount: string | null;
          date_in: string | null;
          date_out: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          vehicle_id?: string | null;
          status: string;
          sale_number?: string | null;
          total_amount?: string | null;
          discount?: string | null;
          final_amount?: string | null;
          date_in?: string | null;
          date_out?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          vehicle_id?: string | null;
          status?: string;
          sale_number?: string | null;
          total_amount?: string | null;
          discount?: string | null;
          final_amount?: string | null;
          date_in?: string | null;
          date_out?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      service_products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          price: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          price: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          price?: string;
          created_at?: string | null;
        };
      };
      services: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          price: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          price: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          price?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          model: string | null;
          plate: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          model?: string | null;
          plate?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          model?: string | null;
          plate?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}