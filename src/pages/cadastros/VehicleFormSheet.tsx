import { useState, useEffect } from "react";
import { StandardSheet } from "@/components/ui/StandardSheet";

import { compressAndConvertToWebP } from "@/utils/imageUtils";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FipeVehicleSelector } from "@/components/vehicles/FipeVehicleSelector";
import type { FipeVehicle } from "@/services/fipeService";
import { clientsService, type VehicleWithPhotos } from "@/services/clientsService";
import { toast } from "sonner";
import { X, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VehicleFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
    onSuccess: () => void;
    onLocalSave?: (vehicle: any, photos: File[]) => void;
    vehicleToEdit?: VehicleWithPhotos | null;
    onDelete?: (id: string) => void;
}

export function VehicleFormSheet({ open, onOpenChange, clientId, onSuccess, onLocalSave, vehicleToEdit, onDelete }: VehicleFormSheetProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [fipeData, setFipeData] = useState<FipeVehicle | null>(null);
    const [plate, setPlate] = useState("");
    const [color, setColor] = useState("");



    // Populate form if editing
    useEffect(() => {
        if (open && vehicleToEdit) {
            setFipeData({
                Marca: vehicleToEdit.brand || "",
                Modelo: vehicleToEdit.model || "",
                AnoModelo: Number(vehicleToEdit.year) || 0,
                CodigoFipe: "",
                MesReferencia: "",
                TipoVeiculo: vehicleToEdit.type === 'carro' ? 1 : vehicleToEdit.type === 'moto' ? 2 : 3,
                SiglaCombustivel: "",
                Combustivel: "",
                Valor: ""
            });
            setPlate(vehicleToEdit.plate || "");
            setColor(vehicleToEdit.color || "");

            // For existing photos, we just show them. 
            // New uploads will be appended to `photos` state.
            // Existing photos are in `vehicleToEdit.vehicle_photos`.
            // We can map these to previews for display, BUT `photos` state is for FILES (new uploads).
            // Mixed state approach:
            setPhotoPreviews(vehicleToEdit.vehicle_photos?.map(p => p.url) || []);
            setPhotos([]); // Clear any previous file selection
        } else if (open && !vehicleToEdit) {
            // Reset if opening in create mode
            setFipeData(null);
            setPlate("");
            setColor("");
            setPhotos([]);
            setPhotoPreviews([]);
        }
    }, [open, vehicleToEdit]);

    // Photo State
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const onFipeSelected = (vehicle: FipeVehicle) => {
        setFipeData(vehicle);
    };

    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsLoading(true);
            try {
                const newFiles = await Promise.all(
                    Array.from(e.target.files).map(async (file) => {
                        return await compressAndConvertToWebP(file);
                    })
                );

                if (photos.length + newFiles.length > 2) {
                    toast.error("Máximo de 2 fotos permitidas.");
                    return;
                }

                const newPreviews = newFiles.map(file => URL.createObjectURL(file));

                setPhotos([...photos, ...newFiles]);
                setPhotoPreviews([...photoPreviews, ...newPreviews]);
            } catch (error) {
                console.error("Erro ao processar imagens:", error);
                toast.error("Erro ao processar imagens.");
            } finally {
                setIsLoading(false);
            }
        }
    };



    const confirmDelete = async () => {
        if (!vehicleToEdit?.id || !onDelete) return;

        try {
            setIsLoading(true);
            await onDelete(vehicleToEdit.id);
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao deletar veículo:", error);
            toast.error("Erro ao deletar veículo");
        } finally {
            setIsLoading(false);
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

            // 1. Save/Update Vehicle
            const vehiclePayload = {
                ...vehiclePayloadBase,
                client_id: clientId,
                user_id: user.id
            };

            let vehicleId = "";

            if (vehicleToEdit) {
                const updatedVehicle = await clientsService.updateVehicle(vehicleToEdit.id, vehiclePayload);
                vehicleId = updatedVehicle.id;
            } else {
                const savedVehicle = await clientsService.addVehicle(vehiclePayload);
                vehicleId = savedVehicle.id;
            }

            // 2. Upload Photos (New Photos only)
            // Existing photos are already on the server. We only upload NEW files in `photos` state.
            if (photos.length > 0 && vehicleId) {
                for (const photo of photos) {
                    const publicUrl = await clientsService.uploadVehiclePhoto(photo);
                    if (publicUrl) {
                        await clientsService.addVehiclePhotoRef(vehicleId, publicUrl);
                    }
                }
            }

            toast.success(vehicleToEdit ? "Veículo atualizado!" : "Veículo adicionado!");
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
        // Only reset if completely closing, or if we want to ensure clean state next open
        // The useEffect handles population on open, so just closing is fine.
        onOpenChange(false);
    };



    return (
        <StandardSheet
            open={open}
            onOpenChange={onOpenChange}
            title={vehicleToEdit ? "Editar Veículo" : "Novo Veículo"}
            onSave={handleSave}
            isLoading={isLoading}
            saveLabel={vehicleToEdit ? "Salvar Alterações" : "Salvar Veículo"}
            isSaveDisabled={!fipeData}
            onDelete={vehicleToEdit?.id ? confirmDelete : undefined}
            deleteLabel="Excluir"
            deleteConfirmTitle="Excluir Veículo"
            deleteConfirmDescription="Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita."
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
