import { supabase } from "@/lib/supabase";

export interface PaymentMethod {
    id: string;
    name: string;
    is_active: boolean;
}

export const paymentMethodsService = {
    getAll: async () => {
        // Use type assertion since payment_methods table exists but not in generated types
        const { data, error } = await (supabase as any)
            .from('payment_methods')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data as PaymentMethod[];
    }
};
