import { supabase } from '../lib/supabase'
import type { Database } from '@/integrations/supabase/types'

type OperationalCostRaw = Database['public']['Tables']['operational_costs']['Row']

export interface SaleData {
    client_id?: string
    vehicle_id?: string
    items: {
        title: string
        unit_price: number
        quantity: number
        service_id?: string
    }[]
    discount?: number
    payment_method?: string
    notes?: string
}

export interface ExpenseData {
    category: string
    description: string
    amount: number
    date: string
}

export interface ProfitReport {
    revenue: number
    expenses: number
    netProfit: number
    period: {
        start: Date
        end: Date
    }
}

export class ErpService {
    /**
     * Registers a new sale (Service Order).
     * Creates a service order with status 'paid' and inserts related items.
     */
    static async registerSale(data: SaleData) {
        // Validation
        const totalAmount = data.items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)
        const discount = data.discount || 0
        const finalAmount = totalAmount - discount

        if (finalAmount < 0) {
            throw new Error("O valor final da venda não pode ser negativo.")
        }
        if (data.items.some(item => item.unit_price < 0)) {
            throw new Error("O preço unitário dos itens não pode ser negativo.")
        }
        if (!data.client_id) {
            throw new Error("Client ID is required for a sale.")
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Usuário não autenticado.")

        // 1. Create Service Order
        const { data: order, error: orderError } = await supabase
            .from('service_orders')
            .insert({
                user_id: user.id,
                client_id: data.client_id,
                vehicle_id: data.vehicle_id,
                status: 'paid', // Assuming a registered sale is completed/paid
                total_amount: totalAmount,
                discount: discount,
                final_amount: finalAmount,
                payment_method: data.payment_method,
                notes: data.notes
            })
            .select()
            .single()

        if (orderError) throw orderError

        // 2. Create Order Items
        const itemsToInsert = data.items.map(item => ({
            service_order_id: order.id,
            service_id: item.service_id,
            title: item.title, // Added title
            price: item.unit_price, // Changed price to unit_price
            quantity: item.quantity,
            user_id: user.id // Added user_id
        }))

        const { error: itemsError } = await supabase
            .from('service_order_items')
            .insert(itemsToInsert)

        if (itemsError) {
            // Rollback/Cleanup would be ideal here if we had transactions, 
            // verifying manually for now or accepting partial failure risk in MVP
            console.error("Erro ao inserir itens da venda:", itemsError)
            throw itemsError
        }

        return order
    }

    /**
     * Registers a new expense.
     */
    static async registerExpense(data: ExpenseData) {
        if (data.amount < 0) {
            throw new Error("O valor da despesa não pode ser negativo.")
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Usuário não autenticado.")

        const { data: expense, error } = await supabase
            .from('expenses')
            .insert({
                user_id: user.id,
                category: data.category,
                title: data.description, // Mapped description to title
                notes: data.description, // Optional: also save to notes
                amount: data.amount,
                date: data.date
            })
            .select()
            .single()

        if (error) throw error
        return expense
    }

    /**
     * Consults inventory status.
     * @returns Placeholder message as inventory system is not yet implemented.
     */
    static async consultInventory() {
        // Placeholder for future implementation
        return {
            message: "Módulo de estoque indisponível no momento.",
            items: []
        }
    }

    /**
     * Calculates profit for a given period.
     */
    static async calculateProfit(startDate: Date, endDate: Date): Promise<ProfitReport> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Usuário não autenticado.")

        const startIso = startDate.toISOString()
        const endIso = endDate.toISOString()

        // 1. Fetch Revenue (Paid/Completed Service Orders)
        const { data: orders, error: ordersError } = await supabase
            .from('service_orders')
            .select('final_amount')
            .eq('user_id', user.id)
            .in('status', ['paid', 'completed'])
            .gte('created_at', startIso)
            .lte('created_at', endIso)

        if (ordersError) throw ordersError

        const revenue = orders?.reduce((sum, order) => sum + (Number(order.final_amount) || 0), 0) || 0

        // 2. Fetch Expenses (Ad-hoc)
        const { data: expenses, error: expensesError } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', user.id)
            .gte('date', startIso)
            .lte('date', endIso)

        if (expensesError) throw expensesError

        const totalExpenses = expenses?.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0) || 0

        // 3. Fetch Operational Costs (Fixed/Variable)
        // We fetch ALL because determining recurrence vs date needs helper logic not easily done in specific SQL range for recurring items
        // For optimization in future: filter one-time by date in SQL, but recurring need all.
        const { data: operationalCosts, error: opCostsError } = await supabase
            .from('operational_costs')
            .select('*')
            .eq('user_id', user.id)

        if (opCostsError) throw opCostsError

        // Calculate Operational Costs for the Period
        let totalOperationalCosts = 0;

        // Calculate days in period for proration
        const oneDay = 24 * 60 * 60 * 1000;
        const daysInPeriod = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)) + 1; // Inclusive

        operationalCosts?.forEach((cost: OperationalCostRaw) => {
            if (cost.is_recurring) {
                // Simplistic Proration: (Monthly Value / 30) * daysInPeriod
                // This assumes the recurring cost is "Monthly".
                // If frequency is 'weekly' or 'daily', we should handle checks. 
                // For MVP, assuming "Monthly" inputs mostly or standard proration.
                // Improve: Check cost.recurrence_frequency

                let dailyValue = 0;
                if (cost.recurrence_frequency === 'weekly') {
                    dailyValue = cost.value / 7;
                } else if (cost.recurrence_frequency === 'daily') {
                    dailyValue = cost.value;
                } else {
                    // Default to monthly
                    dailyValue = cost.value / 30;
                }

                // Check if recurrence ended
                // This is a complex check if period overlaps with recurrence active window. 
                // MVP: If currently active (no end date OR end date > start of period), count it.
                /* 
                   Refined Logic:
                   If recurrence_end_date is set, and it's BEFORE the period starts, ignore.
                   If it ends DURING the period, only count days until end.
                */
                const recEndDate = cost.recurrence_end_date ? new Date(cost.recurrence_end_date) : null;

                if (recEndDate && recEndDate < startDate) {
                    // Recurrence ended before this period
                    return;
                }

                // Cap daysInPeriod if it ends midway
                let effectiveDays = daysInPeriod;
                if (recEndDate && recEndDate < endDate) {
                    const daysUntilEnd = Math.round(Math.abs((recEndDate.getTime() - startDate.getTime()) / oneDay)) + 1;
                    effectiveDays = Math.max(0, daysUntilEnd);
                }

                totalOperationalCosts += (dailyValue * effectiveDays);

            } else {
                // One-time cost
                // Check if expense_date is within period
                if (cost.expense_date) {
                    const d = new Date(cost.expense_date);
                    if (d >= startDate && d <= endDate) {
                        totalOperationalCosts += cost.value;
                    }
                }
            }
        });


        const totalCosts = totalExpenses + totalOperationalCosts;

        return {
            revenue,
            expenses: totalCosts, // Combined expenses
            netProfit: revenue - totalCosts,
            period: {
                start: startDate,
                end: endDate
            }
        }
    }
}
