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

    async updateAccount(id: string, updates: Partial<FinancialAccount>) {
        const { error } = await supabase
            .from('commercial_accounts')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
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
            .select('*')
            .eq('id', accountId)
            .single();

        if (!account) return;

        const currentBalance = (account as any).current_balance || 0;
        const newBalance = type === 'credit'
            ? Number(currentBalance) + Number(amount)
            : Number(currentBalance) - Number(amount);

        await supabase
            .from('commercial_accounts')
            .update({ current_balance: newBalance } as any)
            .eq('id', accountId);
    },

    async transferFunds(fromId: string, toId: string, amount: number, description: string = "") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const txDescription = description || "Transferência entre Contas";
        const txDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // 1. Debit Source
        const debitTx = await this.createTransaction({
            description: txDescription,
            amount: amount,
            type: 'debit',
            category_id: null,
            payment_method: 'Transferência',
            date: txDate,
            account_id: fromId,
            related_entity_type: 'transfer_pair'
        } as any);

        // 2. Credit Destination
        const creditTx = await this.createTransaction({
            description: txDescription,
            amount: amount,
            type: 'credit',
            category_id: null,
            payment_method: 'Transferência',
            date: txDate,
            account_id: toId,
            related_entity_type: 'transfer_pair'
        } as any);

        if (debitTx && creditTx) {
            // Link them
            await supabase.from('financial_transactions').update({ related_entity_id: creditTx.id } as any).eq('id', debitTx.id);
            await supabase.from('financial_transactions').update({ related_entity_id: debitTx.id } as any).eq('id', creditTx.id);
        }
    },

    async deleteTransaction(transactionId: string) {
        // 1. Fetch transaction
        const { data: transaction, error: fetchError } = await supabase
            .from('financial_transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) throw new Error("Transação não encontrada.");
        if ((transaction as FinancialTransaction).is_deleted) return; // Already deleted

        // 2. Revert Balance
        if (transaction.account_id) {
            const reverseType = transaction.type === 'credit' ? 'debit' : 'credit';
            await this.updateAccountBalance(transaction.account_id, transaction.amount, reverseType);
        }

        // 3. Mark as deleted
        // Don't append "(excluída)" anymore as we are filtering by is_deleted status now
        // But for backward compatibility we might keep it or clean it up on restore.
        // The user requirement says "que continuarão com o mesmo visual de agora (riscados e com cor mais apagada)"
        // so we don't necessarily need to change the description, just the flag.

        const { error: updateError } = await supabase
            .from('financial_transactions')
            .update({
                is_deleted: true
            } as any)
            .eq('id', transactionId);

        if (updateError) throw updateError;

        // 4. Delete related transaction if it's a transfer pair
        const txAny = transaction as any;
        if (txAny.related_entity_type === 'transfer_pair' && txAny.related_entity_id) {
            await this.deleteTransaction(txAny.related_entity_id);
        }
    },

    async restoreTransaction(transactionId: string) {
        // 1. Fetch transaction
        const { data: transaction, error: fetchError } = await supabase
            .from('financial_transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) throw new Error("Transação não encontrada.");
        if (!(transaction as FinancialTransaction).is_deleted) return; // Already active

        // 2. Re-apply Balance
        if (transaction.account_id) {
            await this.updateAccountBalance(
                transaction.account_id,
                transaction.amount,
                transaction.type as 'credit' | 'debit'
            );
        }

        // 3. Unmark is_deleted and clean description if needed
        let newDescription = transaction.description;
        if (newDescription.endsWith(' (excluída)')) {
            newDescription = newDescription.replace(' (excluída)', '');
        } else if (newDescription.endsWith('(excluída)')) {
            newDescription = newDescription.replace('(excluída)', '');
        }

        const { error: updateError } = await supabase
            .from('financial_transactions')
            .update({
                is_deleted: false,
                description: newDescription
            } as any)
            .eq('id', transactionId);

        if (updateError) throw updateError;

        // 4. Restore related transaction if it's a transfer pair
        const txAny = transaction as any;
        if (txAny.related_entity_type === 'transfer_pair' && txAny.related_entity_id) {
            await this.restoreTransaction(txAny.related_entity_id);
        }
    }
};
