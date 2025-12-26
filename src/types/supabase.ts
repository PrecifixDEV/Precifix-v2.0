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
                    user_id?: string
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
            monthly_billing: {
                Row: {
                    billing_amount: number
                    created_at: string
                    id: string
                    month: number
                    updated_at: string
                    user_id: string
                    year: number
                }
                Insert: {
                    billing_amount?: number
                    created_at?: string
                    id?: string
                    month: number
                    updated_at?: string
                    user_id: string
                    year: number
                }
                Update: {
                    billing_amount?: number
                    created_at?: string
                    id?: string
                    month?: number
                    updated_at?: string
                    user_id?: string
                    year?: number
                }
                Relationships: []
            }
            monthly_expenses: {
                Row: {
                    created_at: string
                    description: string
                    id: string
                    monthly_billing_id: string
                    operational_cost_id: string | null
                    source: string
                    type: string
                    updated_at: string
                    value: number
                }
                Insert: {
                    created_at?: string
                    description: string
                    id?: string
                    monthly_billing_id: string
                    operational_cost_id?: string | null
                    source?: string
                    type: string
                    updated_at?: string
                    value: number
                }
                Update: {
                    created_at?: string
                    description?: string
                    id?: string
                    monthly_billing_id?: string
                    operational_cost_id?: string | null
                    source?: string
                    type?: string
                    updated_at?: string
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
                    }
                ]
            }
            operational_costs: {
                Row: {
                    created_at: string
                    description: string
                    id: string
                    type: string
                    updated_at: string
                    user_id: string
                    value: number
                    expense_date: string | null
                    is_recurring: boolean | null
                    recurrence_frequency: string | null
                    recurrence_end_date: string | null
                }
                Insert: {
                    created_at?: string
                    description: string
                    id?: string
                    type: string
                    updated_at?: string
                    user_id: string
                    value: number
                    expense_date?: string | null
                    is_recurring?: boolean | null
                    recurrence_frequency?: string | null
                    recurrence_end_date?: string | null
                }
                Update: {
                    created_at?: string
                    description?: string
                    id?: string
                    type?: string
                    updated_at?: string
                    user_id?: string
                    value?: number
                    expense_date?: string | null
                    is_recurring?: boolean | null
                    recurrence_frequency?: string | null
                    recurrence_end_date?: string | null
                }
                Relationships: []
            },
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
                    updated_at: string
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
                    updated_at?: string
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
                    updated_at?: string
                    user_id?: string
                    wednesday_end?: string | null
                    wednesday_start?: string | null
                }
                Relationships: []
            },
            operational_cost_payments: {
                Row: {
                    id: string
                    user_id: string
                    operational_cost_id: string | null
                    description: string
                    due_date: string
                    payment_date: string | null
                    amount_original: number
                    amount_paid: number | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    operational_cost_id?: string | null
                    description: string
                    due_date: string
                    payment_date?: string | null
                    amount_original?: number
                    amount_paid?: number | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    operational_cost_id?: string | null
                    description?: string
                    due_date?: string
                    payment_date?: string | null
                    amount_original?: number
                    amount_paid?: number | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "operational_cost_payments_operational_cost_id_fkey"
                        columns: ["operational_cost_id"]
                        isOneToOne: false
                        referencedRelation: "operational_costs"
                        referencedColumns: ["id"]
                    }
                ]
            },
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
                    user_id?: string
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
            profiles: {
                Row: {
                    created_at: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                    shop_name: string | null
                    updated_at: string | null
                    // New fields
                    first_name: string | null
                    last_name: string | null
                    company_name: string | null
                    document_number: string | null
                    zip_code: string | null
                    address: string | null
                    address_number: string | null
                    phone_number: string | null
                    avatar_url: string | null
                    nickname: string | null
                    residential_complement: string | null
                    company_zip_code: string | null
                    company_address: string | null
                    company_number: string | null
                    company_complement: string | null
                    company_phone: string | null
                    instagram: string | null
                    website: string | null
                    company_logo_url: string | null
                    company_colors: Json | null
                    company_document: string | null
                }
                Insert: {
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    shop_name?: string | null
                    updated_at?: string | null
                    // New fields
                    first_name?: string | null
                    last_name?: string | null
                    company_name?: string | null
                    document_number?: string | null
                    zip_code?: string | null
                    address?: string | null
                    address_number?: string | null
                    phone_number?: string | null
                    avatar_url?: string | null
                    nickname?: string | null
                    residential_complement?: string | null
                    company_zip_code?: string | null
                    company_address?: string | null
                    company_number?: string | null
                    company_complement?: string | null
                    company_phone?: string | null
                    instagram?: string | null
                    website?: string | null
                    company_logo_url?: string | null
                    company_colors?: Json | null
                }
                Update: {
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    shop_name?: string | null
                    updated_at?: string | null
                    // New fields
                    first_name?: string | null
                    last_name?: string | null
                    company_name?: string | null
                    document_number?: string | null
                    zip_code?: string | null
                    address?: string | null
                    address_number?: string | null
                    phone_number?: string | null
                    avatar_url?: string | null
                    nickname?: string | null
                    residential_complement?: string | null
                    company_zip_code?: string | null
                    company_address?: string | null
                    company_number?: string | null
                    company_complement?: string | null
                    company_phone?: string | null
                    instagram?: string | null
                    website?: string | null
                    company_logo_url?: string | null
                    company_colors?: Json | null
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
            services: {
                Row: {
                    active: boolean | null
                    base_price: number
                    category: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    name: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    active?: boolean | null
                    base_price?: number
                    category?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    active?: boolean | null
                    base_price?: number
                    category?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name?: string
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
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
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
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
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
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
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
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
