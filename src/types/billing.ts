
export interface MonthlyBilling {
    id: string;
    user_id: string;
    month: number;
    year: number;
    billing_amount: number;
    created_at: string | null;
    updated_at: string | null;
}

export interface MonthlyExpense {
    id: string;
    monthly_billing_id: string;
    description: string;
    value: number;
    type: 'fixed' | 'variable';
    source: 'global' | 'monthly_override';
    operational_cost_id: string | null;
    created_at: string | null;
    updated_at: string | null;
    day?: number; // Added for UI consistency if needed, though expense_date logic in other tables uses a full date string usually. Retaining original backup structure for now.
}

export interface OperationalCostPayment {
    id: string;
    user_id: string;
    operational_cost_id: string | null;
    description: string;
    due_date: string; // YYYY-MM-DD
    payment_date: string | null; // ISO Date or null
    amount_original: number;
    amount_paid: number | null;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid'; // 'cancelled' for ignored global costs? Or 'overdue' logic handled dynamically. Sticking to plan.
    created_at: string | null;
    updated_at: string | null;
}
