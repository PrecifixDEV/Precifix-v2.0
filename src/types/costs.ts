
export interface OperationalCost {
    id: string;
    description: string;
    value: number;
    type: 'fixed' | 'variable';
    user_id: string;
    created_at: string;
    expense_date?: string | null; // YYYY-MM-DD
    is_recurring?: boolean | null;
    recurrence_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrence_end_date?: string | null; // YYYY-MM-DD
    recurrence_group_id?: string;
    category: string | null;
    /** 'PAID' | 'PENDING' | null */
    status?: string | null;
    observation?: string | null;
    is_operational?: boolean | null;
}

export interface OperationalHours {
    id?: string;
    user_id: string;
    monday_start: string;
    monday_end: string;
    tuesday_start: string;
    tuesday_end: string;
    wednesday_start: string;
    wednesday_end: string;
    thursday_start: string;
    thursday_end: string;
    friday_start: string;
    friday_end: string;
    saturday_start: string;
    saturday_end: string;
    sunday_start: string;
    sunday_end: string;
}


export const daysOfWeek = [
    { key: 'monday', label: 'Seg' },
    { key: 'tuesday', label: 'Ter' },
    { key: 'wednesday', label: 'Qua' },
    { key: 'thursday', label: 'Qui' },
    { key: 'friday', label: 'Sex' },
    { key: 'saturday', label: 'Sáb' },
    { key: 'sunday', label: 'Dom' },
];

export interface FinancialAccount {
    id: string;
    user_id: string;
    name: string;
    type: 'bank' | 'cash' | 'wallet';
    bank_code?: string | null;
    bank_name?: string | null;
    agency?: string | null;
    account_number?: string | null;
    initial_balance: number;
    current_balance: number;
    created_at?: string;
    updated_at?: string;
}

export interface FinancialTransaction {
    id: string;
    user_id: string;
    account_id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    category_id?: string | null;
    payment_method?: string | null;
    date: string; // This is the field name in DB
    transaction_date?: string; // Alias for compatibility
    related_entity_type?: string | null;
    related_entity_id?: string | null;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}
