import { supabase } from "@/lib/supabase";
import type { OperationalCost } from "@/types/costs"; // Type-only import
import { addDays, addMonths, addWeeks, format } from "date-fns"; // Removed unused isAfter and isBefore
import { v4 as uuidv4 } from 'uuid';

export const costService = {
    /**
     * Saves a cost, handling recurrence by generating multiple records if needed.
     */
    saveCost: async (costData: Omit<OperationalCost, 'id' | 'created_at' | 'updated_at' | 'user_id'> & {
        id?: string;
        is_paid?: boolean;
        payment_date?: string;
        payment_method?: string;
        account_id?: string | null;
    }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado.");

        // If editing an existing cost
        if (costData.id) {
            const payload = {
                description: costData.description,
                value: costData.value,
                type: costData.type,
                expense_date: costData.expense_date,
                is_recurring: costData.is_recurring,
                recurrence_frequency: costData.recurrence_frequency,
                recurrence_end_date: costData.recurrence_end_date,
                category: costData.category,
                observation: costData.observation ?? undefined,
            };

            const { data, error } = await supabase
                .from('operational_costs')
                .update(payload)
                .eq('id', costData.id)
                .select()
                .single();

            if (error) throw error;

            // Update associated payment record
            await supabase
                .from('operational_cost_payments')
                .update({
                    description: costData.description,
                    due_date: costData.expense_date as string,
                    amount_original: costData.value
                })
                .eq('operational_cost_id', costData.id)
                .eq('status', 'pending'); // Only update pending ones to avoid overwriting paid historical data

            return data;
        }

        // CREATION LOGIC
        const baseCost = {
            description: costData.description,
            value: costData.value,
            type: costData.type,
            category: costData.category,
            observation: costData.observation ?? undefined,
            is_recurring: costData.is_recurring,
            recurrence_frequency: costData.recurrence_frequency,
            recurrence_end_date: costData.recurrence_end_date,
            user_id: user.id,
            // @ts-ignore - column pending migration
            recurrence_group_id: costData.is_recurring ? uuidv4() : null
        };

        const costsToInsert = [];
        const [year, month, day] = (costData.expense_date as string).split('-').map(Number);
        const startDate = new Date(year, month - 1, day);

        const isActuallyRecurring = Boolean(costData.is_recurring) &&
            costData.recurrence_frequency &&
            costData.recurrence_frequency !== ('none' as any);

        if (isActuallyRecurring) {
            let endDate: Date;
            if (costData.recurrence_end_date) {
                const [endYear, endMonth, endDay] = (costData.recurrence_end_date as string).split('-').map(Number);
                endDate = new Date(endYear, endMonth - 1, endDay);
            } else {
                endDate = addMonths(startDate, 12);
            }

            let currentDate = startDate;
            let iterations = 0;
            const MAX_ITERATIONS = 365 * 5;

            while (iterations < MAX_ITERATIONS) {
                costsToInsert.push({
                    ...baseCost,
                    expense_date: format(currentDate, 'yyyy-MM-dd')
                });

                if (currentDate.getTime() >= endDate.getTime()) break;

                switch (costData.recurrence_frequency) {
                    case 'daily': currentDate = addDays(currentDate, 1); break;
                    case 'weekly': currentDate = addWeeks(currentDate, 1); break;
                    case 'monthly': currentDate = addMonths(currentDate, 1); break;
                    case 'yearly': currentDate = addMonths(currentDate, 12); break;
                    default: currentDate = addDays(currentDate, 1); break;
                }
                iterations++;
            }
        } else {
            costsToInsert.push({
                ...baseCost,
                expense_date: costData.expense_date
            });
        }

        const { data: createdCosts, error: costError } = await supabase
            .from('operational_costs')
            .insert(costsToInsert)
            .select();

        if (costError) throw costError;
        if (!createdCosts) return null;

        // CREATE PAYMENT RECORDS
        const paymentsToInsert = createdCosts.map((cost, index) => {
            const isFirst = index === 0;
            const isActuallyPaid = isFirst && costData.is_paid;

            return {
                user_id: user.id,
                operational_cost_id: cost.id,
                description: cost.description,
                category: cost.category, // Include category!
                due_date: cost.expense_date as string,
                amount_original: cost.value,
                amount_paid: isActuallyPaid ? cost.value : null,
                payment_date: isActuallyPaid ? (costData.payment_date || new Date().toISOString()) : null,
                status: isActuallyPaid ? 'paid' : 'pending'
            };
        });

        const { error: paymentError } = await supabase
            .from('operational_cost_payments')
            .insert(paymentsToInsert);

        if (paymentError) throw paymentError;

        // CREATE FINANCIAL TRANSACTION IF PAID
        if (costData.is_paid && createdCosts.length > 0) {
            const firstCost = createdCosts[0];
            const { financialService } = await import("./financialService");

            await financialService.createTransaction({
                description: `Pgto: ${firstCost.description}`,
                category: firstCost.category || 'Despesa',
                payment_method: costData.payment_method || 'Dinheiro',
                amount: firstCost.value,
                type: 'debit',
                transaction_date: costData.payment_date || new Date().toISOString(),
                account_id: costData.account_id || null,
                related_entity_type: 'operational_cost',
                related_entity_id: firstCost.id,
            });
        }

        return createdCosts;
    },

    /**
     * Deletes a cost. If it has a recurrence_group_id, optionally deletes all related costs.
     */
    deleteCost: async (costId: string, deleteGroup: boolean = false) => {
        // ... existing delete logic ...
        if (deleteGroup) {
            const { data: cost, error: fetchError } = await supabase
                .from('operational_costs')
                .select('recurrence_group_id')
                .eq('id', costId)
                .single();

            if (fetchError) throw fetchError;

            if ((cost as any)?.recurrence_group_id) {
                const { error: deleteError } = await supabase
                    .from('operational_costs')
                    .delete()
                    .eq('recurrence_group_id', (cost as any).recurrence_group_id);

                if (deleteError) throw deleteError;
                return;
            }
        }

        const { error } = await supabase
            .from('operational_costs')
            .delete()
            .eq('id', costId);

        if (error) throw error;
    },

    // --- Compatible methods for refactored UI ---

    async getPayablePayments(monthOrStart: number | string, yearOrEnd?: number | string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let startDate: string;
        let endDate: string;

        if (typeof monthOrStart === 'string' && typeof yearOrEnd === 'string') {
            // Range provided as ISO strings or YYYY-MM-DD
            startDate = monthOrStart;
            endDate = yearOrEnd;
        } else {
            // Month/Year provided
            const m = monthOrStart as number;
            const y = yearOrEnd as number;
            startDate = new Date(y, m - 1, 1).toISOString().split('T')[0];
            endDate = new Date(y, m, 0).toISOString().split('T')[0];
        }

        const { data, error } = await supabase
            .from('operational_cost_payments')
            .select('*')
            .eq('user_id', user.id)
            .gte('due_date', startDate)
            .lte('due_date', endDate)
            .order('due_date', { ascending: true });

        if (error) throw error;
        return data;
    },

    async createCost(data: any) {
        return this.saveCost(data);
    },

    async updateCost(id: string, data: any) {
        return this.saveCost({ ...data, id });
    }
}
