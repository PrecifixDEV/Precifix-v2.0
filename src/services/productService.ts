import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

const deleteStorageImage = async (imageUrl: string) => {
    try {
        const urlParts = imageUrl.split('product-images/');
        if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from('product-images').remove([filePath]);
        }
    } catch (error) {
        console.error('Erro ao excluir imagem do storage:', error);
    }
};

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export const productService = {
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    async getProduct(id: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createProduct(product: ProductInsert) {
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateProduct(id: string, product: ProductUpdate) {
        const { data, error } = await supabase
            .from('products')
            .update(product)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // TODO: Re-enable image deletion when image_url field is added to products table
        // if (oldProduct?.image_url && product.image_url !== undefined && oldProduct.image_url !== product.image_url) {
        //     await deleteStorageImage(oldProduct.image_url);
        // }

        return data;
    },

    async deleteProduct(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir produto:', error);
            throw error;
        }

        // TODO: Re-enable image deletion when image_url field is added to products table
        // if (product?.image_url) {
        //     await deleteStorageImage(product.image_url);
        // }
    },

    async deleteProducts(ids: string[]) {
        const { error } = await supabase
            .from('products')
            .delete()
            .in('id', ids);

        if (error) {
            console.error('Erro ao excluir produtos:', error);
            throw error;
        }

        // TODO: Re-enable image deletion when image_url field is added to products table
        // if (products && products.length > 0) {
        //     const imageUrls = products
        //         .map(p => p.image_url)
        //         .filter(url => url !== null) as string[];
        //     for (const url of imageUrls) {
        //         await deleteStorageImage(url);
        //     }
        // }
    },

    async checkProductAvailability(name: string, code: string | null | undefined, excludeId?: string): Promise<{ nameExists: boolean; codeExists: boolean }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Check Name (case insensitive)
        let nameQuery = supabase
            .from('products')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', name);

        if (excludeId) {
            nameQuery = nameQuery.neq('id', excludeId);
        }

        const { data: nameData, error: nameError } = await nameQuery;
        if (nameError) throw nameError;

        // Check Code (if provided)
        let codeExists = false;
        if (code && code.trim() !== '') {
            let codeQuery = supabase
                .from('products')
                .select('id')
                .eq('user_id', user.id)
                .eq('code', code);

            if (excludeId) {
                codeQuery = codeQuery.neq('id', excludeId);
            }

            const { data: codeData, error: codeError } = await codeQuery;
            if (codeError) throw codeError;
            codeExists = codeData && codeData.length > 0;
        }

        return {
            nameExists: nameData && nameData.length > 0,
            codeExists
        };
    },

    async uploadProductImage(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        return data.publicUrl;
    },
};
