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
            expenses: {
                Row: {
                    amount: number
                    created_at: string
                    date: string
                    description: string
                    id: string
                    type: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    amount?: number
                    created_at?: string
                    date: string
                    description: string
                    id?: string
                    type: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    amount?: number
                    created_at?: string
                    date?: string
                    description?: string
                    id?: string
                    type?: string
                    updated_at?: string
                    user_id?: string
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
                    month: number
                    updated_at: string
                    user_id: string
                    value: number
                    year: number
                }
                Insert: {
                    created_at?: string
                    description: string
                    id?: string
                    month: number
                    updated_at?: string
                    user_id: string
                    value: number
                    year: number
                }
                Update: {
                    created_at?: string
                    description?: string
                    id?: string
                    month?: number
                    updated_at?: string
                    user_id?: string
                    value?: number
                    year?: number
                }
                Relationships: []
            }
            operational_cost_payments: {
                Row: {
                    amount_original: number
                    amount_paid: number
                    created_at: string
                    description: string
                    due_date: string
                    id: string
                    operational_cost_id: string | null
                    payment_date: string | null
                    status: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    amount_original: number
                    amount_paid?: number
                    created_at?: string
                    description: string
                    due_date: string
                    id?: string
                    operational_cost_id?: string | null
                    payment_date?: string | null
                    status?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    amount_original?: number
                    amount_paid?: number
                    created_at?: string
                    description?: string
                    due_date?: string
                    id?: string
                    operational_cost_id?: string | null
                    payment_date?: string | null
                    status?: string
                    updated_at?: string
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
                    created_at: string
                    description: string
                    expense_date: string | null
                    id: string
                    recurrence_frequency: string | null
                    type: string
                    updated_at: string
                    user_id: string
                    value: number
                }
                Insert: {
                    created_at?: string
                    description: string
                    expense_date?: string | null
                    id?: string
                    recurrence_frequency?: string | null
                    type: string
                    updated_at?: string
                    user_id: string
                    value: number
                }
                Update: {
                    created_at?: string
                    description?: string
                    expense_date?: string | null
                    id?: string
                    recurrence_frequency?: string | null
                    type?: string
                    updated_at?: string
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
            }
            products: {
                Row: {
                    code: string | null
                    created_at: string
                    description: string | null
                    dilution: string | null
                    id: string
                    image_url: string | null
                    name: string
                    price: number
                    size: string | null
                    stock_quantity: number
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    code?: string | null
                    created_at?: string
                    description?: string | null
                    dilution?: string | null
                    id?: string
                    image_url?: string | null
                    name: string
                    price?: number
                    size?: string | null
                    stock_quantity?: number
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    code?: string | null
                    created_at?: string
                    description?: string | null
                    dilution?: string | null
                    id?: string
                    image_url?: string | null
                    name?: string
                    price?: number
                    size?: string | null
                    stock_quantity?: number
                    updated_at?: string
                    user_id?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    address: string | null
                    address_number: string | null
                    avatar_url: string | null
                    created_at: string | null
                    document_number: string | null
                    email: string
                    first_name: string | null
                    full_name: string | null
                    id: string
                    last_name: string | null
                    nickname: string | null
                    phone_number: string | null
                    residential_complement: string | null
                    subscription_status: string | null
                    trial_ends_at: string | null
                    updated_at: string | null
                    zip_code: string | null
                }
                Insert: {
                    address?: string | null
                    address_number?: string | null
                    avatar_url?: string | null
                    created_at?: string | null
                    document_number?: string | null
                    email: string
                    first_name?: string | null
                    full_name?: string | null
                    id: string
                    last_name?: string | null
                    nickname?: string | null
                    phone_number?: string | null
                    residential_complement?: string | null
                    subscription_status?: string | null
                    trial_ends_at?: string | null
                    updated_at?: string | null
                    zip_code?: string | null
                }
                Update: {
                    address?: string | null
                    address_number?: string | null
                    avatar_url?: string | null
                    created_at?: string | null
                    document_number?: string | null
                    email?: string
                    first_name?: string | null
                    full_name?: string | null
                    id?: string
                    last_name?: string | null
                    nickname?: string | null
                    phone_number?: string | null
                    residential_complement?: string | null
                    subscription_status?: string | null
                    trial_ends_at?: string | null
                    updated_at?: string | null
                    zip_code?: string | null
                }
                Relationships: []
            }
            sales: {
                Row: {
                    amount: number
                    created_at: string
                    date: string
                    id: string
                    service_id: string | null
                    user_id: string
                }
                Insert: {
                    amount?: number
                    created_at?: string
                    date: string
                    id?: string
                    service_id?: string | null
                    user_id: string
                }
                Update: {
                    amount?: number
                    created_at?: string
                    date?: string
                    id?: string
                    service_id?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "sales_service_id_fkey"
                        columns: ["service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                ]
            }
            service_orders: {
                Row: {
                    client_id: string
                    created_at: string | null
                    date: string
                    description: string | null
                    id: string
                    status: string | null
                    total_amount: number
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    client_id: string
                    created_at?: string | null
                    date: string
                    description?: string | null
                    id?: string
                    status?: string | null
                    total_amount?: number
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    client_id?: string
                    created_at?: string | null
                    date?: string
                    description?: string | null
                    id?: string
                    status?: string | null
                    total_amount?: number
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "service_orders_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    },
                ]
            }
            services: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    name: string
                    price: number
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name: string
                    price?: number
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    name?: string
                    price?: number
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
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
