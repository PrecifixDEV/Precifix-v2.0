import { supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
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
            .select("*")
            .eq("client_id", clientId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
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

    async deleteVehicle(id: string) {
        const { error } = await supabase.from("vehicles").delete().eq("id", id);
        if (error) throw error;
    },

    // Vehicle Photos Methods
    async uploadVehiclePhoto(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

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

