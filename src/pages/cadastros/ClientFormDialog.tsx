
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StandardSheet, StandardSheetToggle } from "@/components/ui/StandardSheet";
import { Loader2, User, Phone, Mail, Car, Trash2, Plus, FileText, MapPin, Calendar, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { clientsService, type Client, type VehicleWithPhotos } from "@/services/clientsService";
import { SleekDatePicker } from "@/components/ui/sleek-date-picker";
import { parseISO, isValid, format } from "date-fns";
import { VehicleFormSheet } from "./VehicleFormSheet";


interface ClientFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientToEdit?: Client | null;
    onSuccess: () => void;
}

export function ClientFormDialog({ open, onOpenChange, clientToEdit, onSuccess }: ClientFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");

    // Optional Fields Visibility
    const [showDocument, setShowDocument] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [showAddress, setShowAddress] = useState(false);
    const [showBirthDate, setShowBirthDate] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    // Optional Fields Values
    const [cpfCnpj, setCpfCnpj] = useState("");
    const [email, setEmail] = useState("");
    const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
    const [cep, setCep] = useState("");
    const [street, setStreet] = useState("");
    const [number, setNumber] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [notes, setNotes] = useState("");

    const [isLoadingCep, setIsLoadingCep] = useState(false);

    // Vehicle Sheet
    const [showVehicleSheet, setShowVehicleSheet] = useState(false);
    const [tempClientId, setTempClientId] = useState<string>("");
    const [vehicles, setVehicles] = useState<VehicleWithPhotos[]>([]);
    const [editingVehicle, setEditingVehicle] = useState<VehicleWithPhotos | null>(null);

    // Store local vehicles (with photos) to be saved later
    const [pendingVehicles, setPendingVehicles] = useState<{ data: any, photos: File[] }[]>([]);

    useEffect(() => {
        if (open) {
            if (clientToEdit) {
                // Populate fields
                setName(clientToEdit.name);
                setWhatsapp(clientToEdit.phone || "");
                setCpfCnpj(clientToEdit.document || "");
                setEmail(clientToEdit.email || "");
                setCep(clientToEdit.zip_code || "");
                setStreet(clientToEdit.address || "");
                setNumber(clientToEdit.number || "");
                setNeighborhood(clientToEdit.neighborhood || "");
                setCity(clientToEdit.city || "");
                setState(clientToEdit.state || "");
                if ((clientToEdit as any).birth_date) {
                    const d = parseISO((clientToEdit as any).birth_date);
                    if (isValid(d)) setBirthDate(d);
                }
                // Notes might need DB migration if not present

                // Set Toggles
                setShowDocument(!!clientToEdit.document);
                setShowEmail(!!clientToEdit.email);
                setShowAddress(!!clientToEdit.address);

                setTempClientId(clientToEdit.id);
                refreshVehicles();
            } else {
                // Reset form
                resetForm();
                // Create a temp ID if needed or wait for save? 
                // For simplicity, we only allow vehicles after initial save if it's new client, 
                // OR we can't add vehicles until client is saved.
                // Let's set tempClientId empty.
                setTempClientId("");
            }
        }
    }, [open, clientToEdit]);

    const resetForm = () => {
        setName("");
        setWhatsapp("");
        setCpfCnpj("");
        setEmail("");
        setBirthDate(undefined);
        setCep("");
        setStreet("");
        setNumber("");
        setNeighborhood("");
        setCity("");
        setState("");
        setNotes("");

        setShowDocument(false);
        setShowEmail(false);
        setShowAddress(false);
        setShowBirthDate(false);
        setShowNotes(false);
        setVehicles([]);
        setPendingVehicles([]); // Clear pending
    };

    const refreshVehicles = async () => {
        if (clientToEdit?.id) {
            const vs = await clientsService.getVehicles(clientToEdit.id);
            setVehicles(vs);
        } else if (tempClientId) {
            const vs = await clientsService.getVehicles(tempClientId);
            setVehicles(vs);
        }
        setEditingVehicle(null);
    };

    const formatPhone = (v: string) => {
        v = v.replace(/\D/g, "");
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        return v;
    };

    const formatCpfCnpj = (v: string) => {
        v = v.replace(/\D/g, "");
        if (v.length > 14) v = v.substring(0, 14);
        if (v.length > 11) {
            return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        }
        return v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 8) v = v.substring(0, 8);
        const formatted = v.replace(/^(\d{5})(\d{3})/, "$1-$2");
        setCep(formatted);

        if (v.length === 8) {
            setIsLoadingCep(true);
            try {
                const res = await fetch(`https://viacep.com.br/ws/${v}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setStreet(data.logradouro);
                    setNeighborhood(data.bairro);
                    setCity(data.localidade);
                    setState(data.uf);
                }
            } catch (err) {
                console.error("CEP error", err);
            } finally {
                setIsLoadingCep(false);
            }
        }
    };

    const handleSave = async () => {
        if (!name || !whatsapp) {
            toast.error("Preencha campos obrigatórios (*)");
            return;
        }

        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const payload: any = {
                user_id: user.id,
                name,
                phone: whatsapp,
                document: cpfCnpj || null,
                email: email || null,
                zip_code: cep || null,
                address: street || null,
                number: number || null,
                neighborhood: neighborhood || null,
                city: city || null,
                state: state || null,
                birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : null,
                complement: null // Not in form yet
            };

            let finalClientId = clientToEdit?.id || tempClientId;

            if (finalClientId) {
                await clientsService.updateClient(finalClientId, payload);
                toast.success("Cliente atualizado!");
            } else {
                const newClient = await clientsService.createClient(payload);
                if (newClient) {
                    finalClientId = newClient.id;
                    setTempClientId(newClient.id);
                    toast.success("Cliente cadastrado!");
                }
            }

            // Save Pending Vehicles if we have a valid Client ID now
            if (finalClientId && pendingVehicles.length > 0) {
                for (const pv of pendingVehicles) {
                    // Prepare payload
                    const vPayload = {
                        ...pv.data,
                        client_id: finalClientId,
                        user_id: user.id
                    };
                    // Remove the temp id we added for rendering
                    delete vPayload.id;

                    const savedV = await clientsService.addVehicle(vPayload);

                    // Upload photos
                    if (savedV && pv.photos.length > 0) {
                        for (const photo of pv.photos) {
                            const publicUrl = await clientsService.uploadVehiclePhoto(photo);
                            if (publicUrl) {
                                await clientsService.addVehiclePhotoRef(savedV.id, publicUrl);
                            }
                        }
                    }
                }
                // Clear pending after save
                setPendingVehicles([]);
                // Refresh list from server
                if (finalClientId) {
                    const vs = await clientsService.getVehicles(finalClientId);
                    setVehicles(vs);
                }
            }

            // Close if strictly saving (not just intermediate save for vehicles)
            if (!showVehicleSheet) {
                onSuccess();
                handleClose();
            }

        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            toast.error("Erro ao salvar cliente");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClient = async () => {
        if (!clientToEdit?.id) return;

        try {
            setIsLoading(true);
            await clientsService.deleteClient(clientToEdit.id);
            toast.success("Cliente excluído com sucesso!");
            onSuccess();
            handleClose();
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            toast.error("Erro ao excluir cliente");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setTempClientId("");
        onOpenChange(false);
    };

    const closeVehicleSheet = (open: boolean) => {
        setShowVehicleSheet(open);
        if (!open) setEditingVehicle(null);
    };



    const handleDeleteVehicle = async (id: string, isPending: boolean = false, skipConfirm: boolean = false) => {
        if (!skipConfirm && !confirm("Remover veículo?")) return;

        if (isPending) {
            setPendingVehicles(prev => prev.filter(v => v.data.id !== id));
            toast.success("Veículo removido (Local)");
        } else {
            await clientsService.deleteVehicle(id);
            refreshVehicles();
            toast.success("Veículo removido");
        }
    };

    // Combine for display
    const allVehicles = [
        ...vehicles,
        ...pendingVehicles.map(pv => ({ ...pv.data, vehicle_photos: [] } as VehicleWithPhotos))
    ];


    return (
        <StandardSheet
            open={open}
            onOpenChange={handleClose}
            title={clientToEdit ? "EDITAR CLIENTE" : "NOVO CLIENTE"}
            onSave={handleSave}
            isLoading={isLoading}
            saveLabel={clientToEdit ? "SALVAR ALTERAÇÕES" : "CADASTRAR CLIENTE"}
            onDelete={clientToEdit ? handleDeleteClient : undefined}
            deleteConfirmTitle="EXCLUIR CLIENTE"
            deleteConfirmDescription={`Deseja realmente excluir o cliente ${name}? Esta ação não pode ser desfeita.`}
            optionalFieldsToggles={
                <>
                    <StandardSheetToggle
                        label="Documento"
                        active={showDocument}
                        onClick={() => setShowDocument(!showDocument)}
                        icon={<FileText className="h-4 w-4" />}
                    />
                    <StandardSheetToggle
                        label="Email"
                        active={showEmail}
                        onClick={() => setShowEmail(!showEmail)}
                        icon={<Mail className="h-4 w-4" />}
                    />
                    <StandardSheetToggle
                        label="Endereço"
                        active={showAddress}
                        onClick={() => setShowAddress(!showAddress)}
                        icon={<MapPin className="h-4 w-4" />}
                    />
                    <StandardSheetToggle
                        label="Nascimento"
                        active={showBirthDate}
                        onClick={() => setShowBirthDate(!showBirthDate)}
                        icon={<Calendar className="h-4 w-4" />}
                    />
                    <StandardSheetToggle
                        label="Observações"
                        active={showNotes}
                        onClick={() => setShowNotes(!showNotes)}
                        icon={<Edit className="h-4 w-4" />}
                    />
                </>
            }
        >
            <div className="space-y-6">
                {/* Mandatory Fields Section */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-9 bg-white dark:bg-zinc-950 border-input"
                                placeholder="Ex: João da Silva"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                                id="whatsapp"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                                className="pl-9 bg-white dark:bg-zinc-950 border-input"
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                            />
                        </div>
                    </div>
                </div>

                {/* Optional Fields Content (MOVED TO TOP) */}
                <div className="space-y-4">
                    {showDocument && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                            <Label>CPF / CNPJ</Label>
                            <Input
                                value={cpfCnpj}
                                onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                                className="bg-white dark:bg-zinc-950 border-input"
                                placeholder="000.000.000-00"
                                maxLength={18}
                            />
                        </div>
                    )}

                    {showEmail && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                            <Label>Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                    placeholder="cliente@email.com"
                                />
                            </div>
                        </div>
                    )}

                    {showBirthDate && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                            <Label>Data de Nascimento</Label>
                            <SleekDatePicker
                                date={birthDate}
                                onSelect={setBirthDate}
                                placeholder="Selecione a data de nascimento"
                                className="bg-white dark:bg-zinc-950 border-input"
                            />
                        </div>
                    )}

                    {showAddress && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div className="space-y-2">
                                <Label>CEP</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={cep}
                                        onChange={handleCepChange}
                                        className="bg-white dark:bg-zinc-950 border-input"
                                        placeholder="00000-000"
                                        maxLength={9}
                                    />
                                    {isLoadingCep && <Loader2 className="w-5 h-5 animate-spin text-zinc-500 self-center" />}
                                </div>
                            </div>
                            <div className="grid grid-cols-[2fr_1fr] gap-3">
                                <div className="space-y-2">
                                    <Label>Rua</Label>
                                    <Input
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                        className="bg-white dark:bg-zinc-950 border-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Número</Label>
                                    <Input
                                        value={number}
                                        onChange={(e) => setNumber(e.target.value)}
                                        className="bg-white dark:bg-zinc-950 border-input"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Bairro</Label>
                                <Input
                                    value={neighborhood}
                                    onChange={(e) => setNeighborhood(e.target.value)}
                                    className="bg-white dark:bg-zinc-950 border-input"
                                    maxLength={40}
                                />
                            </div>
                            <div className="grid grid-cols-[2fr_1fr] gap-3">
                                <div className="space-y-2">
                                    <Label>Cidade</Label>
                                    <Input
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="bg-white dark:bg-zinc-950 border-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>UF</Label>
                                    <Input
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="bg-white dark:bg-zinc-950 border-input uppercase"
                                        maxLength={2}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {showNotes && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                            <Label>Observações</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="bg-white dark:bg-zinc-950 border-input min-h-[80px]"
                                placeholder="Informações adicionais..."
                            />
                        </div>
                    )}
                </div>

                {/* Inline Vehicle List (Always Visible) */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Car className="w-4 h-4 text-yellow-500" />
                            Veículos
                        </Label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Always allow opening logic - removed the requirement to save first
                                setShowVehicleSheet(true);
                            }}
                            className="bg-white dark:bg-zinc-900 border-green-600/30 hover:border-green-500 text-green-600 dark:text-green-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs h-8"
                        >
                            <Plus className="w-3 h-3 mr-1.5" />
                            Novo Veículo
                        </Button>
                    </div>

                    {allVehicles.length === 0 ? (
                        <div className="text-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                            <Car className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500">Nenhum veículo cadastrado</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {allVehicles.map((vehicle) => {
                                // Safe check for vehicle_photos
                                const hasPhoto = vehicle.vehicle_photos && vehicle.vehicle_photos.length > 0;
                                const photoUrl = hasPhoto ? vehicle.vehicle_photos[0].url : null;
                                const isTemp = vehicle.id.startsWith('temp-');

                                return (
                                    <div
                                        key={vehicle.id}
                                        onClick={() => {
                                            setEditingVehicle(vehicle);
                                            setShowVehicleSheet(true);
                                        }}
                                        className="relative overflow-hidden flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg group min-h-[72px] cursor-pointer hover:border-yellow-500/50 transition-colors"
                                    >
                                        {/* Background Image & Gradient */}
                                        {photoUrl && (
                                            <>
                                                <img
                                                    src={photoUrl}
                                                    className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80"
                                                    alt="Vehicle"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50 to-transparent dark:from-zinc-900 dark:via-zinc-900 dark:to-transparent" />
                                            </>
                                        )}

                                        <div className="relative z-10 flex-1 pr-4">
                                            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 flex items-center">
                                                {vehicle.model}
                                                {isTemp && <span className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold bg-yellow-100 dark:bg-yellow-500/10 px-1.5 py-0.5 rounded ml-2 border border-yellow-200 dark:border-transparent">NOVO</span>}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{vehicle.brand} • {vehicle.plate || 'S/ Placa'}</p>
                                        </div>

                                        <div className="relative z-10">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteVehicle(vehicle.id, isTemp);
                                                }}
                                                className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* NESTED SHEET FOR VEHICLE */}
            <VehicleFormSheet
                open={showVehicleSheet}
                onOpenChange={closeVehicleSheet}
                clientId={clientToEdit?.id || tempClientId}
                onSuccess={refreshVehicles}
                onLocalSave={(vData, vPhotos) => {
                    setPendingVehicles(prev => [...prev, { data: vData, photos: vPhotos }]);
                }}
                vehicleToEdit={editingVehicle}
                onDelete={(id) => handleDeleteVehicle(id, id.startsWith('temp-'), true)}
            />
        </StandardSheet>
    );
}


