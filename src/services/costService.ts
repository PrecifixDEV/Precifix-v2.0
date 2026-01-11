import { supabase } from "@/lib/supabase";
import type { OperationalCost } from "@/types/costs"; // Type-only import
import { addDays, addMonths, addWeeks, format, isBefore } from "date-fns"; // Removed unused isAfter
import { v4 as uuidv4 } from 'uuid';

export const costService = {
    /**
     * Saves a cost, handling recurrence by generating multiple records if needed.
     */
    saveCost: async (costData: Omit<OperationalCost, 'id' | 'created_at' | 'updated_at' | 'user_id'> & { id?: string }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado.");

        // If editing an existing cost, we check if it's part of a recurrence group
        if (costData.id) {
            // For now, editing a recurring cost instance only updates that specific instance
            // unless we implement "update all future" logic later.
            // But if it was NOT recurring and BECOMES recurring, we might need logic.
            // For simplicity/MVP as per request: Standard edit behavior (single row) 
            // OR if the user intends to edit the "Series", we'd need more UI.
            // Given the request focuses on CREATION and DELETION, we'll keep Update simple for now:
            const payload = {
                description: costData.description,
                value: costData.value,
                type: costData.type,
                expense_date: costData.expense_date,
                is_recurring: costData.is_recurring,
                recurrence_frequency: costData.recurrence_frequency,
                recurrence_end_date: costData.recurrence_end_date,
                category: costData.category,
                // Do not change recurrence_group_id on edit of single item for now to avoid breaking groups
                // user_id: user.id // Usually don't update user_id
            };

            const { data, error } = await supabase
                .from('operational_costs')
                .update(payload)
                .eq('id', costData.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        // CREATION LOGIC
        const baseCost = {
            description: costData.description,
            value: costData.value,
            type: costData.type,
            category: costData.category,
            // expense_date will vary
            is_recurring: costData.is_recurring,
            recurrence_frequency: costData.recurrence_frequency,
            recurrence_end_date: costData.recurrence_end_date,
            user_id: user.id,
            // @ts-ignore - column pending migration
            recurrence_group_id: costData.is_recurring ? uuidv4() : null
        };

        const costsToInsert = [];
        // Manually parse YYYY-MM-DD to avoid UTC conversion issues (off-by-one error)
        const [year, month, day] = (costData.expense_date as string).split('-').map(Number);
        const startDate = new Date(year, month - 1, day); // Local midnight

        // Fixed comparison: ensure we don't compare 'none' with the union type if it doesn't overlap, or cast it.
        // Actually, costData.recurrence_frequency is typed as 'daily' | ... | undefined.
        // If the UI passes 'none', it might be coerced or ignored.
        // We should check if it is truthy and not 'none' (if 'none' was passed from UI state).
        if (costData.is_recurring && costData.recurrence_end_date && costData.recurrence_frequency && costData.recurrence_frequency !== ('none' as any)) {
            const endDate = new Date(costData.recurrence_end_date);
            let currentDate = startDate;

            // Safety break to prevent infinite loops
            let iterations = 0;
            const MAX_ITERATIONS = 365 * 5; // 5 years max

            while ((isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) && iterations < MAX_ITERATIONS) {
                costsToInsert.push({
                    ...baseCost,
                    expense_date: format(currentDate, 'yyyy-MM-dd')
                });

                // Next date
                switch (costData.recurrence_frequency) {
                    case 'daily':
                        currentDate = addDays(currentDate, 1);
                        break;
                    case 'weekly':
                        currentDate = addWeeks(currentDate, 1);
                        break;
                    case 'monthly':
                        currentDate = addMonths(currentDate, 1);
                        break;
                    case 'yearly':
                        currentDate = addMonths(currentDate, 12); // addYears is also valid but addMonths(12) works fine if we don't import addYears
                        break;
                    default:
                        // specific logic or break
                        currentDate = addDays(currentDate, 1); // fallback
                        break;
                }
                iterations++;
            }
        } else {
            // Single insert
            costsToInsert.push({
                ...baseCost,
                expense_date: costData.expense_date
            });
        }

        const { data, error } = await supabase
            .from('operational_costs')
            .insert(costsToInsert)
            .select();

        if (error) throw error;
        return data; // Returns array
    },

    /**
     * Deletes a cost. If it has a recurrence_group_id, optionally deletes all related costs.
     */
    deleteCost: async (costId: string, deleteGroup: boolean = false) => {
        if (deleteGroup) {
            // 1. Get the cost to find the group ID
            const { data: cost, error: fetchError } = await supabase
                .from('operational_costs')
                // @ts-ignore - column pending migration
                .select('recurrence_group_id')
                .eq('id', costId)
                .single();

            if (fetchError) throw fetchError;

            if ((cost as any)?.recurrence_group_id) {
                // Delete all in group
                const { error: deleteError } = await supabase
                    .from('operational_costs')
                    .delete()
                    // @ts-ignore - column pending migration
                    .eq('recurrence_group_id', (cost as any).recurrence_group_id);

                if (deleteError) throw deleteError;
                return;
            }
        }

        // Default: delete only single row (or if no group id)
        const { error } = await supabase
            .from('operational_costs')
            .delete()
            .eq('id', costId);

        if (error) throw error;
    }
}
