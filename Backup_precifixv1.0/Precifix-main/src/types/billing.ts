
export interface MonthlyBilling {
    id: string;
    user_id: string;
    month: number;
    year: number;
    billing_amount: number;
    created_at: string;
    updated_at: string;
}

export interface MonthlyExpense {
    id: string;
    monthly_billing_id: string;
    description: string;
    value: number;
    type: 'fixed' | 'variable';
    source: 'global' | 'monthly_override';
    operational_cost_id: string | null;
    created_at: string;
    updated_at: string;
}
