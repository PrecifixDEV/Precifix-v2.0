import { supabase } from "@/lib/supabase";
import type { FinancialAccount, FinancialTransaction } from "@/types/costs";

export const financialService = {
    // Accounts
    async getAccounts() {
        const { data, error } = await supabase
            .from('commercial_accounts')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as FinancialAccount[];
    },

    async createAccount(account: Omit<FinancialAccount, 'id' | 'user_id' | 'created_at' | 'current_balance'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('commercial_accounts')
            .insert({
                ...account,
                user_id: user.id,
                current_balance: account.initial_balance // Start with initial
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteAccount(id: string) {
        const { error } = await supabase
            .from('commercial_accounts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Transactions
    async getTransactions(accountId?: string) {
        let query = supabase
            .from('financial_transactions')
            .select('*, commercial_accounts(name)')
            .order('transaction_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (accountId) {
            query = query.eq('account_id', accountId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as (FinancialTransaction & { commercial_accounts: { name: string } | null })[];
    },

    async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'user_id' | 'created_at'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('financial_transactions')
            .insert({
                ...transaction,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;

        // Update Account Balance using RPC (Atomic) or simple calculation
        // For now, let's update simply
        if (transaction.account_id) {
            await this.updateAccountBalance(transaction.account_id, transaction.amount, transaction.type);
        }

        return data;
    },

    async updateAccountBalance(accountId: string, amount: number, type: 'credit' | 'debit') {
        // Fetch current
        const { data: account } = await supabase
            .from('commercial_accounts')
            .select('current_balance')
            .eq('id', accountId)
            .single();

        if (!account) return;

        const newBalance = type === 'credit'
            ? Number(account.current_balance) + Number(amount)
            : Number(account.current_balance) - Number(amount);

        await supabase
            .from('commercial_accounts')
            .update({ current_balance: newBalance })
            .eq('id', accountId);
    },

    async transferFunds(fromId: string, toId: string, amount: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // 1. Debit Source
        await this.createTransaction({
            description: `Transferência enviada`,
            amount: amount,
            type: 'debit',
            transaction_date: new Date().toISOString(),
            account_id: fromId,
        });

        // 2. Credit Destination
        await this.createTransaction({
            description: `Transferência recebida`,
            amount: amount,
            type: 'credit',
            transaction_date: new Date().toISOString(),
            account_id: toId,
        });

        // Note: createTransaction already calls updateAccountBalance, so balances are updated.
        // Ideally this should be a DB function (RPC) for transaction safety, 
        // but for now relying on sequential execution is acceptable given current architecture.
    }
};
