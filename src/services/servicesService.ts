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
    quantity: number;
    dilution_ratio?: string | null;
    container_size_ml?: number | null;
}

export const servicesService = {
    async getServices() {
        const { data: services, error } = await supabase
            .from("services")
            .select("*, service_products(id)")
            .order("name");

        if (error) throw error;

        // Fetch sales data to aggregate
        const { data: salesItems, error: salesError } = await supabase
            .from("service_order_items")
            .select("service_id, quantity, price");

        if (salesError) {
            console.error("Error fetching sales items:", salesError);
            // Return services without sales data if error (or handle differently)
            return services as unknown as ServiceWithProductCount[];
        }

        // Aggregate sales data
        const salesMap = new Map<string, { count: number; value: number }>();

        salesItems?.forEach(item => {
            if (item.service_id) {
                const current = salesMap.get(item.service_id) || { count: 0, value: 0 };
                salesMap.set(item.service_id, {
                    count: current.count + (item.quantity || 0),
                    value: current.value + ((item.quantity || 0) * (item.price || 0))
                });
            }
        });

        const servicesWithSales = services.map(service => {
            const stats = salesMap.get(service.id) || { count: 0, value: 0 };
            return {
                ...service,
                total_sales_count: stats.count,
                total_sales_value: stats.value
            };
        });

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
        const { data: newService, error: serviceError } = await supabase
            .from("services")
            .insert(service)
            .select()
            .single();

        if (serviceError) throw serviceError;

        if (products.length > 0) {
            const serviceProducts: NewServiceProduct[] = products.map((p) => ({
                service_id: newService.id,
                product_id: p.product_id,
                quantity: p.quantity,
                dilution_ratio: p.dilution_ratio,
                container_size_ml: p.container_size_ml
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
            const serviceProducts: NewServiceProduct[] = products.map((p) => ({
                service_id: id,
                product_id: p.product_id,
                quantity: p.quantity,
                dilution_ratio: p.dilution_ratio,
                container_size_ml: p.container_size_ml
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
