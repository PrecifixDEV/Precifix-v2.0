import { useState } from "react";
import { StandardSheet } from "@/components/ui/StandardSheet";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FipeVehicleSelector } from "@/components/vehicles/FipeVehicleSelector";
import type { FipeVehicle } from "@/services/fipeService";
import { clientsService } from "@/services/clientsService";
import { toast } from "sonner";
import { X, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VehicleFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
    onSuccess: () => void;
    onLocalSave?: (vehicle: any, photos: File[]) => void;
}

export function VehicleFormSheet({ open, onOpenChange, clientId, onSuccess, onLocalSave }: VehicleFormSheetProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [fipeData, setFipeData] = useState<FipeVehicle | null>(null);
    const [plate, setPlate] = useState("");
    const [color, setColor] = useState("");

    // Photo State
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const onFipeSelected = (vehicle: FipeVehicle) => {
        setFipeData(vehicle);
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            if (photos.length + newFiles.length > 2) {
                toast.error("Máximo de 2 fotos permitidas.");
                return;
            }

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));

            setPhotos([...photos, ...newFiles]);
            setPhotoPreviews([...photoPreviews, ...newPreviews]);
        }
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...photos];
        const newPreviews = [...photoPreviews];

        newPhotos.splice(index, 1);
        newPreviews.splice(index, 1);

        setPhotos(newPhotos);
        setPhotoPreviews(newPreviews);
    };

    const handleSave = async () => {
        if (!fipeData) return;

        // Construct base payload shared by both methods
        const vehiclePayloadBase = {
            brand: fipeData.Marca,
            model: fipeData.Modelo,
            year: String(fipeData.AnoModelo),
            plate: plate.toUpperCase() || null,
            color: color || null,
            type: fipeData.TipoVeiculo === 1 ? 'carro' : fipeData.TipoVeiculo === 2 ? 'moto' : 'caminhao',
        };

        // LOCAL SAVE MODE (No Client ID yet)
        if (!clientId && onLocalSave) {
            onLocalSave({
                ...vehiclePayloadBase,
                // Mock ID for list rendering
                id: `temp-${Date.now()}`,
            }, photos);

            toast.success("Veículo adicionado (Local)");
            onSuccess(); // Triggers refresh or equivalent
            handleClose();
            return;
        }

        // DB SAVE MODE (Existing Client ID)
        if (!clientId) return;

        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // 1. Save Vehicle
            const vehiclePayload = {
                ...vehiclePayloadBase,
                client_id: clientId,
                user_id: user.id
            };

            const savedVehicle = await clientsService.addVehicle(vehiclePayload);

            // 2. Upload Photos
            if (photos.length > 0 && savedVehicle) {
                for (const photo of photos) {
                    const publicUrl = await clientsService.uploadVehiclePhoto(photo);
                    if (publicUrl) {
                        await clientsService.addVehiclePhotoRef(savedVehicle.id, publicUrl);
                    }
                }
            }

            toast.success("Veículo adicionado com sucesso!");
            onSuccess();
            handleClose();

        } catch (error: any) {
            console.error("Erro ao salvar veículo:", error);
            // @ts-ignore
            toast.error("Erro ao salvar veículo: " + (error.message || "Erro desconhecido"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFipeData(null);
        setPlate("");
        setColor("");
        setPhotos([]);
        setPhotoPreviews([]);
        onOpenChange(false);
    };

    return (
        <StandardSheet
            open={open}
            onOpenChange={handleClose}
            title="Novo Veículo"
            onSave={handleSave}
            isLoading={isLoading}
            saveLabel="Salvar Veículo"
            isSaveDisabled={!fipeData}
        >
            <div className="space-y-6">
                {/* FIPE Selector */}
                <div className="space-y-2">
                    <Label className="text-zinc-500 dark:text-zinc-400">Buscar na Tabela FIPE</Label>
                    <FipeVehicleSelector onVehicleSelected={onFipeSelected} />
                </div>

                {fipeData && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <h4 className="font-bold text-zinc-900 dark:text-white text-lg">{fipeData.Modelo}</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{fipeData.Marca} • {fipeData.AnoModelo}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Placa</Label>
                                <Input
                                    value={plate}
                                    onChange={(e) => setPlate(e.target.value)}
                                    placeholder="ABC-1234"
                                    maxLength={8}
                                    className="bg-white dark:bg-zinc-950 border-input uppercase font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cor</Label>
                                <Input
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="Ex: Prata"
                                    className="bg-white dark:bg-zinc-950 border-input"
                                />
                            </div>
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-3">
                            <Label>Fotos do Veículo (Máx. 2)</Label>

                            <div className="grid grid-cols-2 gap-4">
                                {photoPreviews.map((preview, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
                                        <img src={preview} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
                                        <button
                                            onClick={() => removePhoto(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {photos.length < 2 && (
                                    <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-yellow-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                                        <Camera className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mb-2" />
                                        <span className="text-xs text-zinc-500">Adicionar Foto</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoSelect}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StandardSheet>
    );
}
