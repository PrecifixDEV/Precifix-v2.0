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
                    user_id?: string
                    wednesday_end?: string | null
                    wednesday_start?: string | null
                }
                Relationships: []
            }
            products: {
                Row: {
                    code: string | null
                    created_at: string | null
                    description: string | null
                    dilution: string | null
                    id: string
                    image_url: string | null
                    name: string
                    price: number
                    size: string | null
                    stock_quantity: number
                    updated_at: string | null
                    user_id: string
                    is_for_sale: boolean
                    sale_price: number | null
                }
                Insert: {
                    code?: string | null
                    created_at?: string | null
                    description?: string | null
                    dilution?: string | null
                    id?: string
                    image_url?: string | null
                    name: string
                    price: number
                    size?: string | null
                    stock_quantity: number
                    updated_at?: string | null
                    user_id: string
                    is_for_sale?: boolean
                    sale_price?: number | null
                }
                Update: {
                    code?: string | null
                    created_at?: string | null
                    description?: string | null
                    dilution?: string | null
                    id?: string
                    image_url?: string | null
                    name?: string
                    price?: number
                    size?: string | null
                    stock_quantity?: number
                    updated_at?: string | null
                    user_id?: string
                    is_for_sale?: boolean
                    sale_price?: number | null
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
            services: {
                Row: {
                    created_at: string | null
                    description: string | null
                    duration_minutes: number
                    id: string
                    name: string
                    price: number
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    duration_minutes: number
                    id?: string
                    name: string
                    price: number
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    duration_minutes?: number
                    id?: string
                    name?: string
                    price?: number
                    updated_at?: string | null
                    user_id?: string
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
