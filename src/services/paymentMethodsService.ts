import { supabase } from "@/lib/supabase";

export interface PaymentMethod {
    id: string;
    name: string;
    is_active: boolean;
}

export const paymentMethodsService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data as PaymentMethod[];
    }
};
