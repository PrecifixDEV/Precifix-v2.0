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

    async transferFunds(fromId: string, toId: string, amount: number, description: string = "") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const txDescription = description || "Transferência entre Contas";

        // 1. Debit Source
        const debitTx = await this.createTransaction({
            description: txDescription,
            amount: amount,
            type: 'debit',
            category: 'Transferência',
            payment_method: 'Transferência',
            transaction_date: new Date().toISOString(),
            account_id: fromId,
            related_entity_type: 'transfer_pair'
        });

        // 2. Credit Destination
        const creditTx = await this.createTransaction({
            description: txDescription,
            amount: amount,
            type: 'credit',
            category: 'Transferência',
            payment_method: 'Transferência',
            transaction_date: new Date().toISOString(),
            account_id: toId,
            related_entity_type: 'transfer_pair'
        });

        if (debitTx && creditTx) {
            // Link them
            await supabase.from('financial_transactions').update({ related_entity_id: creditTx.id }).eq('id', debitTx.id);
            await supabase.from('financial_transactions').update({ related_entity_id: debitTx.id }).eq('id', creditTx.id);
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
        if (transaction.related_entity_type === 'transfer_pair' && transaction.related_entity_id) {
            await this.deleteTransaction(transaction.related_entity_id);
        }
    },

    async restoreTransaction(transactionId: string) {
        const { data: transaction, error: fetchError } = await supabase
            .from('financial_transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (fetchError || !transaction) throw new Error("Transação não encontrada.");
        if (!(transaction as FinancialTransaction).is_deleted) return;

        if (transaction.account_id) {
            await this.updateAccountBalance(
                transaction.account_id,
                transaction.amount,
                transaction.type as 'credit' | 'debit'
            );
        }

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

        if (transaction.related_entity_type === 'transfer_pair' && transaction.related_entity_id) {
            await this.restoreTransaction(transaction.related_entity_id);
        }
    },

    // --- New Integrated Payment Logic ---

    /**
     * Registers a payment for either a Payable or Receivable item.
     * Marks the item as paid/partially_paid and creates a bank transaction.
     */
    async registerPayment(params: {
        type: 'payable' | 'receivable',
        id: string, // ID of the payment record (operational_cost_payments or financial_receivable_payments)
        accountId: string,
        amountPaid: number,
        paymentDate: string,
        category?: string,
        paymentMethod?: string
    }) {
        const { type, id, accountId, amountPaid, paymentDate, category, paymentMethod } = params;

        // 1. Fetch the payment record to get details
        const table = type === 'payable' ? 'operational_cost_payments' : 'financial_receivable_payments';
        const { data: payment, error: fetchError } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !payment) throw new Error(`${type === 'payable' ? 'Pagamento' : 'Recebimento'} não encontrado.`);

        const status = amountPaid < payment.amount_original ? 'partially_paid' : 'paid';

        // 2. Update the payment record
        const { error: updateError } = await supabase
            .from(table)
            .update({
                amount_paid: amountPaid,
                payment_date: paymentDate,
                status: status
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // 3. Create the bank transaction
        const txType = type === 'payable' ? 'debit' : 'credit';
        await this.createTransaction({
            description: payment.description,
            amount: amountPaid,
            type: txType,
            // @ts-ignore
            category: category || (payment as any).category || (type === 'payable' ? 'Despesa' : 'Receita'),
            payment_method: paymentMethod || 'Dinheiro',
            transaction_date: paymentDate,
            account_id: accountId,
            related_entity_type: type === 'payable' ? 'operational_cost' : 'financial_receivable',
            // @ts-ignore
            related_entity_id: (payment as any).operational_cost_id || (payment as any).financial_receivable_id
        });

        return { success: true, status };
    },

    // --- Receivables CRUD ---

    async getReceivables(month?: number, year?: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        let query = supabase.from('financial_receivables').select('*').eq('user_id', user.id);

        if (month !== undefined && year !== undefined) {
            const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month, 0).toISOString().split('T')[0];
            query = query.gte('expense_date', startDate).lte('expense_date', endDate);
        }

        const { data, error } = await query.order('expense_date', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getReceivablePayments(month: number, year: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('financial_receivable_payments')
            .select('*')
            .eq('user_id', user.id)
            .gte('due_date', startDate)
            .lte('due_date', endDate);

        if (error) throw error;
        return data;
    },

    async createReceivable(receivable: any) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('financial_receivables')
            .insert({ ...receivable, user_id: user.id })
            .select()
            .single();

        if (error) throw error;

        // Automatically create a payment record for the receivable
        if (data) {
            await supabase.from('financial_receivable_payments').insert([{
                user_id: user.id,
                financial_receivable_id: data.id,
                description: data.description,
                due_date: data.expense_date,
                amount_original: data.value,
                status: 'pending'
            }] as any);
        }

        return data;
    }
}
