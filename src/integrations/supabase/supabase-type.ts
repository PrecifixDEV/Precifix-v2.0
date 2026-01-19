export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string | null;
                    email: string | null;
                    phone: string | null;
                    document: string | null;
                    address: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    document?: string | null;
                    address?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    document?: string | null;
                    address?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            commercial_accounts: {
                Row: {
                    id: string;
                    user_id: string;
                    account_name: string | null;
                    bank: string | null;
                    agency: string | null;
                    account_number: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    account_name?: string | null;
                    bank?: string | null;
                    agency?: string | null;
                    account_number?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    account_name?: string | null;
                    bank?: string | null;
                    agency?: string | null;
                    account_number?: string | null;
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
                    date?: string;
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
                    description: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    parent_id: string | null;
                    scope: string | null;
                    is_operational: boolean | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    description?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                    parent_id?: string | null;
                    scope?: string | null;
                    is_operational?: boolean | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    description?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                    parent_id?: string | null;
                    scope?: string | null;
                    is_operational?: boolean | null;
                };
            };
            financial_transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    amount: string;
                    transaction_date: string | null;
                    type: string | null;
                    category_id: string | null;
                    notes: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    amount: string;
                    transaction_date?: string | null;
                    type?: string | null;
                    category_id?: string | null;
                    notes?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    amount?: string;
                    transaction_date?: string | null;
                    type?: string | null;
                    category_id?: string | null;
                    notes?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            monthly_billing: {
                Row: {
                    id: string;
                    user_id: string;
                    month: string | null;
                    year: number | null;
                    total: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    month?: string | null;
                    year?: number | null;
                    total?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    month?: string | null;
                    year?: number | null;
                    total?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            monthly_expenses: {
                Row: {
                    id: string;
                    user_id: string;
                    month: string | null;
                    year: number | null;
                    total: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    month?: string | null;
                    year?: number | null;
                    total?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    month?: string | null;
                    year?: number | null;
                    total?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            operational_cost_payments: {
                Row: {
                    id: string;
                    user_id: string;
                    operational_cost_id: string | null;
                    amount: string;
                    payment_date: string | null;
                    method_id: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    operational_cost_id?: string | null;
                    amount: string;
                    payment_date?: string | null;
                    method_id?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    operational_cost_id?: string | null;
                    amount?: string;
                    payment_date?: string | null;
                    method_id?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            operational_costs: {
                Row: {
                    id: string;
                    user_id: string;
                    description: string;
                    value: string;
                    type: string;
                    expense_date: string | null;
                    is_recurring: boolean | null;
                    recurrence_frequency: string | null;
                    recurrence_end_date: string | null;
                    created_at: string | null;
                    recurrence_group_id: string | null;
                    issue_date: string | null;
                    accrual_date: string | null;
                    due_date: string | null;
                    installment_number: number | null;
                    installments_total: number | null;
                    status: string | null;
                    category: string | null;
                    observation: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    description: string;
                    value: string;
                    type: string;
                    expense_date?: string | null;
                    is_recurring?: boolean | null;
                    recurrence_frequency?: string | null;
                    recurrence_end_date?: string | null;
                    created_at?: string | null;
                    recurrence_group_id?: string | null;
                    issue_date?: string | null;
                    accrual_date?: string | null;
                    due_date?: string | null;
                    installment_number?: number | null;
                    installments_total?: number | null;
                    status?: string | null;
                    category?: string | null;
                    observation?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    description?: string;
                    value?: string;
                    type?: string;
                    expense_date?: string | null;
                    is_recurring?: boolean | null;
                    recurrence_frequency?: string | null;
                    recurrence_end_date?: string | null;
                    created_at?: string | null;
                    recurrence_group_id?: string | null;
                    issue_date?: string | null;
                    accrual_date?: string | null;
                    due_date?: string | null;
                    installment_number?: number | null;
                    installments_total?: number | null;
                    status?: string | null;
                    category?: string | null;
                    observation?: string | null;
                };
            };
            operational_hours: {
                Row: {
                    id: string;
                    user_id: string;
                    date: string | null;
                    hours: number | null;
                    description: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    date?: string | null;
                    hours?: number | null;
                    description?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    date?: string | null;
                    hours?: number | null;
                    description?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            payment_methods: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string | null;
                    details: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name?: string | null;
                    details?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string | null;
                    details?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            products: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    code: string | null;
                    description: string | null;
                    price: string | null;
                    size: string | null;
                    dilution: string | null;
                    stock_quantity: string | null;
                    image_url: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    is_for_sale: boolean | null;
                    sale_price: string | null;
                    is_dilutable: boolean | null;
                    dilution_ratio: string | null;
                    container_size_ml: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    code?: string | null;
                    description?: string | null;
                    price?: string | null;
                    size?: string | null;
                    dilution?: string | null;
                    stock_quantity?: string | null;
                    image_url?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                    is_for_sale?: boolean | null;
                    sale_price?: string | null;
                    is_dilutable?: boolean | null;
                    dilution_ratio?: string | null;
                    container_size_ml?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    code?: string | null;
                    description?: string | null;
                    price?: string | null;
                    size?: string | null;
                    dilution?: string | null;
                    stock_quantity?: string | null;
                    image_url?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                    is_for_sale?: boolean | null;
                    sale_price?: string | null;
                    is_dilutable?: boolean | null;
                    dilution_ratio?: string | null;
                    container_size_ml?: string | null;
                };
            };
            profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    bio: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            service_order_items: {
                Row: {
                    id: string;
                    user_id: string;
                    service_order_id: string | null;
                    service_id: string | null;
                    product_id: string | null;
                    quantity: number | null;
                    unit_price: string | null;
                    total_price: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    service_order_id?: string | null;
                    service_id?: string | null;
                    product_id?: string | null;
                    quantity?: number | null;
                    unit_price?: string | null;
                    total_price?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    service_order_id?: string | null;
                    service_id?: string | null;
                    product_id?: string | null;
                    quantity?: number | null;
                    unit_price?: string | null;
                    total_price?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            service_orders: {
                Row: {
                    id: string;
                    user_id: string;
                    client_id: string | null;
                    status: string | null;
                    total: string | null;
                    issued_at: string | null;
                    due_date: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    client_id?: string | null;
                    status?: string | null;
                    total?: string | null;
                    issued_at?: string | null;
                    due_date?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    client_id?: string | null;
                    status?: string | null;
                    total?: string | null;
                    issued_at?: string | null;
                    due_date?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            service_products: {
                Row: {
                    id: string;
                    service_id: string;
                    product_id: string;
                    created_at: string | null;
                    user_id: string;
                };
                Insert: {
                    id?: string;
                    service_id: string;
                    product_id: string;
                    created_at?: string | null;
                    user_id: string;
                };
                Update: {
                    id?: string;
                    service_id?: string;
                    product_id?: string;
                    created_at?: string | null;
                    user_id?: string;
                };
            };
            services: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    description: string | null;
                    price: string | null;
                    duration_minutes: number | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    description?: string | null;
                    price?: string | null;
                    duration_minutes?: number | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    description?: string | null;
                    price?: string | null;
                    duration_minutes?: number | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
            };
            vehicles: {
                Row: {
                    id: string;
                    user_id: string;
                    make: string | null;
                    model: string | null;
                    plate: string | null;
                    year: number | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    make?: string | null;
                    model?: string | null;
                    plate?: string | null;
                    year?: number | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    make?: string | null;
                    model?: string | null;
                    plate?: string | null;
                    year?: number | null;
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
