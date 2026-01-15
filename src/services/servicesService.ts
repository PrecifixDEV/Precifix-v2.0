import { supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types";

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceWithProductCount = Service & {
    service_products: { id: string }[];
    total_sales_count?: number;
    total_sales_value?: number;
};
export type NewService = Database["public"]["Tables"]["services"]["Insert"];
export type UpdateService = Database["public"]["Tables"]["services"]["Update"];

export type ServiceProduct = Database["public"]["Tables"]["service_products"]["Row"] & {
    products: Database["public"]["Tables"]["products"]["Row"];
};
export type NewServiceProduct = Database["public"]["Tables"]["service_products"]["Insert"];

export interface ServiceProductInput {
    product_id: string;
    // Products in services are now reference-only (no quantity/dilution)
    // Cost calculations handled via operational expenses
}

export const servicesService = {
    async getServices() {
        const { data: services, error } = await supabase
            .from("services")
            .select("*, service_products(id)")
            .order("name");

        if (error) throw error;

        // TODO: Re-enable sales data when service_order_items table is created
        // For now, return services with zero sales stats
        const servicesWithSales = services.map(service => ({
            ...service,
            total_sales_count: 0,
            total_sales_value: 0
        }));

        return servicesWithSales as unknown as ServiceWithProductCount[];
    },

    async getService(id: string) {
        const { data, error } = await supabase
            .from("services")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    },

    async getServiceProducts(serviceId: string) {
        const { data, error } = await supabase
            .from("service_products")
            .select("*, products(*)")
            .eq("service_id", serviceId);

        if (error) {
            console.error("Error fetching service products:", error);
            throw error;
        }
        return data as ServiceProduct[];
    },

    async createService(service: NewService, products: ServiceProductInput[] = []) {
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data: newService, error: serviceError } = await supabase
            .from("services")
            .insert({ ...service, user_id: user.id })
            .select()
            .single();

        if (serviceError) throw serviceError;

        if (products.length > 0) {
            const serviceProducts: NewServiceProduct[] = products.map((p) => ({
                service_id: newService.id,
                product_id: p.product_id,
                quantity: 1, // Default quantity for reference-only products
                user_id: user.id,
                // No dilution - products are reference-only
            }));

            const { error: productsError } = await supabase
                .from("service_products")
                .insert(serviceProducts);

            if (productsError) throw productsError;
        }

        return newService;
    },

    async updateService(id: string, updates: UpdateService, products: ServiceProductInput[] = []) {
        const { data: updatedService, error: serviceError } = await supabase
            .from("services")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (serviceError) throw serviceError;

        // Delete existing products for this service (simple replacement strategy)
        const { error: deleteError } = await supabase
            .from("service_products")
            .delete()
            .eq("service_id", id);

        if (deleteError) throw deleteError;

        // Insert new products
        if (products.length > 0) {
            // Get authenticated user for user_id in service_products
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const serviceProducts: NewServiceProduct[] = products.map((p) => ({
                service_id: id,
                product_id: p.product_id,
                quantity: 1, // Default quantity
                user_id: user.id,
                // No dilution - products are reference-only
            }));

            const { error: productsError } = await supabase
                .from("service_products")
                .insert(serviceProducts);

            if (productsError) throw productsError;
        }

        return updatedService;
    },

    async deleteService(id: string) {
        const { error } = await supabase.from("services").delete().eq("id", id);
        if (error) throw error;
    },
};
