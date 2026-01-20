import { supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type VehicleWithPhotos = Vehicle & { vehicle_photos: { url: string }[] };
export type ClientWithVehicles = Client & { vehicles: Vehicle[] };
export type NewClient = Database["public"]["Tables"]["clients"]["Insert"];
export type UpdateClient = Database["public"]["Tables"]["clients"]["Update"];

export interface VehiclePhoto {
    id: string;
    vehicle_id: string;
    url: string;
    created_at: string;
}

export const clientsService = {
    async getClients() {
        const { data, error } = await supabase
            .from("clients")
            .select("*, vehicles(*)")
            .order("name");

        if (error) throw error;
        return data as ClientWithVehicles[];
    },

    async getClient(id: string) {
        const { data, error } = await supabase
            .from("clients")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    },

    async createClient(client: NewClient) {
        const { data, error } = await supabase
            .from("clients")
            .insert(client)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateClient(id: string, updates: UpdateClient) {
        const { data, error } = await supabase
            .from("clients")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteClient(id: string) {
        const { error } = await supabase.from("clients").delete().eq("id", id);
        if (error) throw error;
    },

    // Vehicle Methods
    async getVehicles(clientId: string) {
        const { data, error } = await supabase
            .from("vehicles")
            .select("*, vehicle_photos(url)")
            .eq("client_id", clientId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data as unknown as VehicleWithPhotos[];
    },

    async addVehicle(vehicle: Database["public"]["Tables"]["vehicles"]["Insert"]) {
        const { data, error } = await supabase
            .from("vehicles")
            .insert(vehicle)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateVehicle(id: string, updates: Database["public"]["Tables"]["vehicles"]["Update"]) {
        const { data, error } = await supabase
            .from("vehicles")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteVehicle(id: string) {
        // 1. Fetch associated photos
        const { data: photos } = await (supabase as any)
            .from('vehicle_photos')
            .select('url')
            .eq('vehicle_id', id);

        if (photos && photos.length > 0) {
            // 2. Extract paths from URLs
            // URL Format: .../storage/v1/object/public/vehicle-images/USER_ID/FILE_NAME
            // or .../vehicle-images/USER_ID/FILE_NAME
            const pathsToRemove = photos.map((p: any) => {
                const url = p.url;
                // split by bucket name to get the relative path
                const parts = url.split('/vehicle-images/');
                if (parts.length > 1) {
                    return parts[1]; // Returns USER_ID/FILE_NAME
                }
                return null;
            }).filter((p: any) => p !== null);

            // 3. Delete from Storage
            if (pathsToRemove.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('vehicle-images')
                    .remove(pathsToRemove);

                if (storageError) {
                    console.error('Error deleting photos from storage:', storageError);
                    // We continue to delete the vehicle even if storage cleanup fails, 
                    // relying on manual cleanup or cron jobs for orphaned files if strict consistency isn't critical
                }
            }
        }

        // 4. Delete Vehicle (Cascade deletes photo records)
        const { error } = await supabase.from("vehicles").delete().eq("id", id);
        if (error) throw error;
    },

    // Vehicle Photos Methods
    async uploadVehiclePhoto(file: File) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('vehicle-images')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    async addVehiclePhotoRef(vehicleId: string, url: string) {
        const { data, error } = await (supabase as any)
            .from('vehicle_photos')
            .insert({ vehicle_id: vehicleId, url })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getVehiclePhotos(vehicleId: string) {
        const { data, error } = await (supabase as any)
            .from('vehicle_photos')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as VehiclePhoto[];
    },

    async deleteVehiclePhoto(id: string) {
        // Note: For now we only delete the DB reference. 
        // Ideally we should also delete from storage, but we need the path, not just full URL.
        const { error } = await (supabase as any).from('vehicle_photos').delete().eq('id', id);
        if (error) throw error;
    },
};

export type NewVehicle = Database["public"]["Tables"]["vehicles"]["Insert"];

