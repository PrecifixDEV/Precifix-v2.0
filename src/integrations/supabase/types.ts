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
            financial_transactions: {
                Row: {
                    account_id: string | null
                    amount: number
                    category: string | null
                    created_at: string | null
                    description: string
                    id: string
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
                    }
                ]
            }
            expenses: {
                Row: {
                    amount: number
                    category: string
                    created_at: string | null
                    date: string
                    description: string | null
                    id: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    amount: number
                    category: string
                    created_at?: string | null
                    date: string
                    description?: string | null
                    id?: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    amount?: number
                    category?: string
                    created_at?: string | null
                    date?: string
                    description?: string | null
                    id?: string
                    updated_at?: string | null
                    user_id?: string
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
                Relationships: []
            }
            operational_cost_payments: {
                Row: {
                    amount_original: number
                    amount_paid: number | null
                    created_at: string | null
                    description: string
                    due_date: string
                    id: string
                    operational_cost_id: string | null
                    payment_date: string | null
                    status: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    amount_original: number
                    amount_paid?: number | null
                    created_at?: string | null
                    description: string
                    due_date: string
                    id?: string
                    operational_cost_id?: string | null
                    payment_date?: string | null
                    status: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    amount_original?: number
                    amount_paid?: number | null
                    created_at?: string | null
                    description?: string
                    due_date?: string
                    id?: string
                    operational_cost_id?: string | null
                    payment_date?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            operational_costs: {
                Row: {
                    created_at: string
                    description: string
                    expense_date: string | null
                    id: string
                    is_recurring: boolean | null
                    recurrence_end_date: string | null
                    recurrence_frequency: string | null
                    type: string
                    user_id: string
                    value: number
                }
                Insert: {
                    created_at?: string
                    description: string
                    expense_date?: string | null
                    id?: string
                    is_recurring?: boolean | null
                    recurrence_end_date?: string | null
                    recurrence_frequency?: string | null
                    type: string
                    user_id: string
                    value: number
                }
                Update: {
                    created_at?: string
                    description?: string
                    expense_date?: string | null
                    id?: string
                    is_recurring?: boolean | null
                    recurrence_end_date?: string | null
                    recurrence_frequency?: string | null
                    type?: string
                    user_id?: string
                    value?: number
                }
                Relationships: []
            }
            operational_hours: {
                Row: {
                    created_at: string
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
                    created_at?: string
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
                    created_at?: string
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
                Relationships: []
            }
            products: {
                Row: {
                    code: string | null
                    category: string | null
                    container_size_ml: number | null
                    created_at: string | null
                    description: string | null
                    dilution_ratio: string | null
                    id: string
                    image_url: string | null
                    is_dilutable: boolean | null
                    is_for_sale: boolean | null
                    name: string
                    price: number
                    sale_price: number | null
                    size: string | null
                    stock_quantity: number
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    code?: string | null
                    category?: string | null
                    container_size_ml?: number | null
                    created_at?: string | null
                    description?: string | null
                    dilution_ratio?: string | null
                    id?: string
                    image_url?: string | null
                    is_dilutable?: boolean | null
                    is_for_sale?: boolean | null
                    name: string
                    price: number
                    sale_price?: number | null
                    size?: string | null
                    stock_quantity: number
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    code?: string | null
                    category?: string | null
                    container_size_ml?: number | null
                    created_at?: string | null
                    description?: string | null
                    dilution_ratio?: string | null
                    id?: string
                    image_url?: string | null
                    is_dilutable?: boolean | null
                    is_for_sale?: boolean | null
                    name?: string
                    price?: number
                    sale_price?: number | null
                    size?: string | null
                    stock_quantity?: number
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
                    created_at: string
                    document_number: string | null
                    email: string
                    first_name: string | null
                    full_name: string | null
                    id: string
                    instagram: string | null
                    kiwify_subscription_id: string | null
                    last_name: string | null
                    mobile_phone: string | null
                    nickname: string | null
                    phone_number: string | null
                    residential_complement: string | null
                    role: string | null
                    shop_name: string | null
                    subscription_status: string | null
                    trial_ends_at: string | null
                    updated_at: string
                    website: string | null
                    zip_code: string | null
                    initial_investment: number | null
                    investment_return_months: number | null
                    working_capital_goal: number | null
                    working_capital_months: number | null
                    include_investment: boolean | null
                    include_working_capital: boolean | null
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
                    created_at?: string
                    document_number?: string | null
                    email: string
                    first_name?: string | null
                    full_name?: string | null
                    id: string
                    instagram?: string | null
                    kiwify_subscription_id?: string | null
                    last_name?: string | null
                    mobile_phone?: string | null
                    nickname?: string | null
                    phone_number?: string | null
                    residential_complement?: string | null
                    role?: string | null
                    shop_name?: string | null
                    subscription_status?: string | null
                    trial_ends_at?: string | null
                    updated_at?: string
                    website?: string | null
                    zip_code?: string | null
                    initial_investment?: number | null
                    investment_return_months?: number | null
                    working_capital_goal?: number | null
                    working_capital_months?: number | null
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
                    created_at?: string
                    document_number?: string | null
                    email?: string
                    first_name?: string | null
                    full_name?: string | null
                    id?: string
                    instagram?: string | null
                    kiwify_subscription_id?: string | null
                    last_name?: string | null
                    mobile_phone?: string | null
                    nickname?: string | null
                    phone_number?: string | null
                    residential_complement?: string | null
                    role?: string | null
                    shop_name?: string | null
                    subscription_status?: string | null
                    trial_ends_at?: string | null
                    updated_at?: string
                    website?: string | null
                    zip_code?: string | null
                    initial_investment?: number | null
                    investment_return_months?: number | null
                    working_capital_goal?: number | null
                    working_capital_months?: number | null
                }
                Relationships: []
            }
            service_order_items: {
                Row: {
                    created_at: string | null
                    id: string
                    price: number
                    quantity: number
                    service_id: string | null
                    service_order_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    price: number
                    quantity: number
                    service_id?: string | null
                    service_order_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    price?: number
                    quantity?: number
                    service_id?: string | null
                    service_order_id?: string
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
                    client_id: string
                    created_at: string | null
                    discount: number | null
                    final_amount: number
                    id: string
                    notes: string | null
                    payment_method: string | null
                    status: string
                    total_amount: number
                    updated_at: string | null
                    user_id: string
                    vehicle_id: string | null
                }
                Insert: {
                    client_id: string
                    created_at?: string | null
                    discount?: number | null
                    final_amount: number
                    id?: string
                    notes?: string | null
                    payment_method?: string | null
                    status: string
                    total_amount: number
                    updated_at?: string | null
                    user_id: string
                    vehicle_id?: string | null
                }
                Update: {
                    client_id?: string
                    created_at?: string | null
                    discount?: number | null
                    final_amount?: number
                    id?: string
                    notes?: string | null
                    payment_method?: string | null
                    status?: string
                    total_amount?: number
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
                    container_size_ml: number | null
                    created_at: string
                    dilution_ratio: string | null
                    id: string
                    product_id: string
                    quantity: number
                    service_id: string
                    user_id: string
                }
                Insert: {
                    container_size_ml?: number | null
                    created_at?: string
                    dilution_ratio?: string | null
                    id?: string
                    product_id: string
                    quantity: number
                    service_id: string
                    user_id?: string
                }
                Update: {
                    container_size_ml?: number | null
                    created_at?: string
                    dilution_ratio?: string | null
                    id?: string
                    product_id?: string
                    quantity?: number
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
                    created_at: string | null
                    description: string | null
                    duration_minutes: number
                    icon: string | null
                    id: string
                    name: string
                    base_price: number
                    updated_at: string | null
                    user_id: string
                    commission_percent: number | null
                    other_costs: number | null
                    labor_cost_per_hour: number | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    duration_minutes: number
                    icon?: string | null
                    id?: string
                    name: string
                    base_price: number
                    updated_at?: string | null
                    user_id: string
                    commission_percent?: number | null
                    other_costs?: number | null
                    labor_cost_per_hour?: number | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    duration_minutes?: number
                    icon?: string | null
                    id?: string
                    name?: string
                    base_price?: number
                    updated_at?: string | null
                    user_id?: string
                    commission_percent?: number | null
                    other_costs?: number | null
                    labor_cost_per_hour?: number | null
                }
                Relationships: []
            }
            vehicles: {
                Row: {
                    brand: string
                    client_id: string
                    color: string | null
                    created_at: string | null
                    id: string
                    model: string
                    plate: string | null
                    updated_at: string | null
                    year: number | null
                    type: string | null
                    user_id: string | null
                }
                Insert: {
                    brand: string
                    client_id: string
                    color?: string | null
                    created_at?: string | null
                    id?: string
                    model: string
                    plate?: string | null
                    updated_at?: string | null
                    year?: number | null
                    type?: string | null
                    user_id?: string | null
                }
                Update: {
                    brand?: string
                    client_id?: string
                    color?: string | null
                    created_at?: string | null
                    id?: string
                    model?: string
                    plate?: string | null
                    updated_at?: string | null
                    year?: number | null
                    type?: string | null
                    user_id?: string | null
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
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    TableName extends PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    TableName extends PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    TableName extends PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    EnumName extends PublicEnumNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: Exclude<keyof Database, "__InternalSupabase"> },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? "CompositeTypes" extends keyof Database[PublicCompositeTypeNameOrOptions["schema"]]
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: Exclude<keyof Database, "__InternalSupabase"> }
    ? "CompositeTypes" extends keyof Database[PublicCompositeTypeNameOrOptions["schema"]]
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : never
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
