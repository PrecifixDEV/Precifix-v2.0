import { supabase } from "@/lib/supabase";

export interface StorageFile {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: any;
    bucket_id: string;
    url: string; // Public URL we construct
}

export const storageService = {
    /**
     * List files for a user in a specific bucket.
     * Assumes a folder structure of `{bucket}/{userId}/...` or similar, 
     * but for some buckets files might be at root with RLS.
     * 
     * - vehicle-images: stored in folder named by user ID? 
     *   Re-checking migration: `(storage.foldername(name))[1] = auth.uid()::text` implies folders.
     *   So we list from folder `{userId}`.
     * 
     * - product-images: `productService` does `upload(fileName, file)`. It seems to put them at root?
     *   `deleteStorageImage` splits by `product-images/`.
     *   `productService.ts`: `const filePath = ${fileName};` -> ROOT.
     *   RLS for products? Need to check. 
     *   If they are at root, we can't easily filter by user unless we trust RLS list?
     *   Or maybe we query the `products` table to get valid known images?
     *   
     *   Actually, `storageService.list` lists files in a path.
     *   If `product-images` files are mixed at root, `list()` at root might return ALL if RLS allows, or only user's if RLS restricts.
     *   
     * - avatars: `Profile.tsx` uploads to `{userId}.ext` at root. 
     *   `MyCompany.tsx` uploads to `company/company_logo_{userId}.ext`.
     */
    async listUserFiles(bucket: string, userId: string): Promise<StorageFile[]> {
        let path = '';

        // Strategy depends on bucket structure
        if (bucket === 'vehicle-images') {
            path = userId; // Folder is user ID
        } else if (bucket === 'product-images') {
            // If products are at root, we list root.
            // CAUTION: If RLS doesn't filter SELECT on objects, we might see others'.
            // But usually 'select' policy on objects determines visibility.
            path = '';
        } else if (bucket === 'avatars') {
            // Avatars has 'company' folder and root files.
            // We might need to list both.
            path = '';
        }

        const { data, error } = await supabase.storage
            .from(bucket)
            .list(path, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            });

        if (error) throw error;

        // For avatars, we might want to also look in 'company' subfolder if we are at root
        let files = data || [];

        if (bucket === 'avatars') {
            // Also fetch 'company' folder if we were looking at root
            const { data: companyData } = await supabase.storage
                .from(bucket)
                .list('company');

            if (companyData) {
                // Map to include folder prefix
                const companyFiles = companyData.map(f => ({
                    ...f,
                    name: `company/${f.name}`
                }));
                // Filter to only show THIS user's company logo? 
                // The filename is `company_logo_{userId}.{ext}`.
                // So we can filter.
                const myCompanyFiles = companyFiles.filter(f => f.name.includes(userId));
                files = [...files, ...myCompanyFiles];
            }
            // Filter root files for userId (avatars are `{userId}.{ext}`)
            files = files.filter(f => f.name.startsWith(userId) || f.name.startsWith('company/'));
        }

        // Construct public URLs
        return files.map(file => {
            const fullPath = path ? `${path}/${file.name}` : file.name;
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fullPath);
            return {
                ...file,
                bucket_id: bucket,
                url: publicUrl,
                name: fullPath // Ensure name is full path for deletion logic
            };
        });
    },

    async deleteFile(bucket: string, path: string) {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
    },

    async cleanupReference(bucket: string, publicUrl: string, userId: string) {
        // 1. Vehicle Photos
        if (bucket === 'vehicle-images') {
            // These are rows in 'vehicle_photos'
            // We delete the row directly by URL
            const { error } = await supabase
                .from('vehicle_photos' as any)
                .delete()
                .eq('url', publicUrl);

            if (error) console.error("Error cleaning up vehicle_photo:", error);
        }

        // 2. Product Images
        else if (bucket === 'product-images') {
            // These are in 'products.image_url'
            // We set them to null
            const { error } = await supabase
                .from('products')
                .update({ image_url: null })
                .eq('image_url', publicUrl)
                .eq('user_id', userId); // Safety check

            if (error) console.error("Error cleaning up product image:", error);
        }

        // 3. Avatars
        else if (bucket === 'avatars') {
            // Could be 'avatar_url' OR 'company_logo_url' in 'profiles'

            // Try clearing avatar_url
            const { error: err1 } = await supabase
                .from('profiles')
                .update({ avatar_url: null })
                .eq('avatar_url', publicUrl)
                .eq('id', userId);

            // Try clearing company_logo_url
            const { error: err2 } = await supabase
                .from('profiles')
                .update({ company_logo_url: null })
                .eq('company_logo_url', publicUrl)
                .eq('id', userId);

            // Also update auth metadata? 
            // That's more complex, usually handled by triggers or manual updates. 
            // We'll skip auth metadata sync for now as it's a cache.
            if (err1) console.error("Error cleaning avatar:", err1);
            if (err2) console.error("Error cleaning company logo:", err2);
        }
    }
};
