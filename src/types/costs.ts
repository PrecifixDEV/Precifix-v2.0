
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
    bank_code?: string;
    initial_balance: number;
    current_balance: number;
    color?: string;
    created_at?: string;
}

export interface FinancialTransaction {
    id: string;
    user_id: string;
    account_id: string | null;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    category?: string;
    payment_method?: string;
    transaction_date: string;
    related_entity_type?: string;
    related_entity_id?: string;
    is_deleted?: boolean;
    created_at?: string;
}

export interface FinancialReceivable {
    id: string;
    description: string;
    value: number;
    type: string;
    user_id: string;
    client_id?: string | null;
    created_at: string;
    expense_date?: string | null; // Symmetry with AP
    is_recurring?: boolean | null;
    recurrence_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrence_end_date?: string | null;
    recurrence_group_id?: string;
    category: string | null;
    status: string;
    observation?: string | null;
}

export interface FinancialReceivablePayment {
    id: string;
    user_id: string;
    financial_receivable_id: string | null;
    description: string;
    due_date: string;
    payment_date: string | null;
    amount_original: number;
    amount_paid: number | null;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
    created_at?: string;
    updated_at?: string;
}
