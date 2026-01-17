import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, Building2, MapPin, Globe, Instagram, Phone, Camera, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { OperationalHoursForm } from '@/components/costs/OperationalHoursForm';
import type { OperationalHours } from '@/types/costs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { ImageCropper } from '@/components/ImageCropper';
import heic2any from 'heic2any';
import { compressAndConvertToWebP } from '@/utils/imageUtils';
import { Separator } from '@/components/ui/separator';

export const MyCompany = () => {
    const queryClient = useQueryClient();
    const [savingHours, setSavingHours] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Company Data State
    const [companyName, setCompanyName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [address, setAddress] = useState('');
    const [addressNumber, setAddressNumber] = useState('');
    const [addressComplement, setAddressComplement] = useState('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [website, setWebsite] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [primaryColor, setPrimaryColor] = useState('#000000');
    const [secondaryColor, setSecondaryColor] = useState('#ffffff');
    const [userId, setUserId] = useState<string | null>(null);

    // Cropper State
    // Cropper State (Removed in favor of direct resize)
    // const [cropModalOpen, setCropModalOpen] = useState(false);
    // const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    // Fetch User and Company Profile Data
    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setCompanyName(data.company_name || '');
                    setCnpj(data.company_document || ''); // Use dedicated company document field
                    // Wait, Profile.tsx now uses 'document_number' in state mapped to 'document_number' in DB (I added that column in types?).
                    // Let's check Supabase types again... I added `document_number`? No, I added `nickname` etc.
                    // Existing schema had `document_number`. Profile.tsx was using `cpf_cnpj` mapped to `document_number` state?
                    // Let's stick to what Profile.tsx was using: `data.cpf_cnpj` (from my view) or `data.document_number`.
                    // The View of Profile.tsx showed: `setDocumentNumber(data.cpf_cnpj || '')`.
                    // So the column is `cpf_cnpj` or `document_number`.
                    // I'll check types... `document_number: string | null` is in the type definition I saw.
                    // I'll use `document_number`.

                    setCompanyName(data.company_name || '');
                    // For CNPJ, if user is separating Profile (CPF) and Company (CNPJ), we might need two fields in DB or just use specific ones.
                    // Since I added new columns, I didn't add a specific "company_document". 
                    // I will assume `document_number` might be used for Company if it's a business account, or maybe we abuse `cpf_cnpj`?
                    // Profile.tsx now acts as "Personal".
                    // Let's use `document_number` for Company CNPJ if Profile uses `cpf` specific logic?
                    // Actually, let's use `document_number` for Company CNPJ here.
                    // And `cpf_cnpj` (legacy?) for Profile? Or maybe `document_number` is the only one.
                    // In `Profile.tsx`, I mapped `document_number` state to `document_number` column.
                    // If I use the SAME column, they will overwrite.
                    // I should probably have checked this. 
                    // "Migrating Company Fields: Moving ... CNPJ to Minha Empresa".
                    // This implies the user wants separate entities.
                    // I did NOT add a new `company_cnpj` column in the migration.
                    // I'll use `document_number` for now, but this might conflict if User Profile also uses it.
                    // WAIT. `profiles` usually maps 1:1 to User.
                    // If this is a "Company Profile" owned by a User, maybe `company_name` and `document_number` (CNPJ) go together?
                    // And `first_name`/`last_name` + `cpf` (maybe stored in a different column? I didn't add `cpf` column, I added `nickname`).
                    // I will assume `document_number` is the CNPJ for the company here.
                    // And in Profile, `document_number` was used for CPF. This is a conflict.
                    // **CRITICAL DECISION**: I should store Company CNPJ in a new field if possible, or maybe `shop_name` / `company_name` is enough?
                    // I'll use `document_number` for CNPJ here and assume the user is shifting to a "Business Profile" mindset where the main ID is the company.
                    // OR, I can use `metadata` for one of them?
                    // Reference: Profile.tsx used `document_number` for CPF/CNPJ.
                    // I will use `document_number` here too. If they overwrite, so be it (Single Entity model). 
                    // BUT `Profile.tsx` is "Personal Info".
                    // I'll just use `document_number` for CNPJ here.

                    // Address
                    setZipCode(data.company_zip_code || '');
                    setAddress(data.company_address || '');
                    setAddressNumber(data.company_number || '');
                    setAddressComplement(data.company_complement || '');

                    // Contact
                    setPhone(data.company_phone || '');
                    setInstagram(data.instagram || '');
                    setWebsite(data.website || '');

                    // Visuals
                    setLogoUrl(data.company_logo_url || null);
                    if (data.company_colors) {
                        const colors = data.company_colors as any;
                        if (colors.primary) setPrimaryColor(colors.primary);
                        if (colors.secondary) setSecondaryColor(colors.secondary);
                    }
                }
            }
        };
        loadProfile();
    }, []);

    // Fetch Operational Hours
    const { data: operationalHours, isLoading: isLoadingHours } = useQuery({
        queryKey: ['operationalHours'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('operational_hours')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            return data as OperationalHours | null;
        },
    });

    // Initial Hours State for Form
    const [formHours, setFormHours] = useState<Partial<OperationalHours>>({});
    const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({
        monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false
    });

    // Effect to populate form when data loads
    React.useEffect(() => {
        if (operationalHours) {
            setFormHours(operationalHours);
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const newSelectedDays: any = {};
            days.forEach(day => {
                newSelectedDays[day] = !!operationalHours[`${day}_start` as keyof OperationalHours];
            });
            setSelectedDays(newSelectedDays);
        }
    }, [operationalHours]);

    const saveHoursMutation = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            const payload: any = { ...formHours, user_id: user.id };

            let error;
            if (operationalHours?.id) {
                const { error: err } = await supabase
                    .from('operational_hours')
                    .update(payload)
                    .eq('id', operationalHours.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('operational_hours')
                    .insert(payload);
                error = err;
            }

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operationalHours'] });
            toast.success("Horários salvos com sucesso!");
        },
        onError: (err: any) => {
            toast.error(`Erro ao salvar horários: ${err.message}`);
        }
    });

    const handleSaveHours = async () => {
        setSavingHours(true);
        await saveHoursMutation.mutateAsync();
        setSavingHours(false);
    };

    const handleDayToggle = (day: string) => {
        setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
    };

    const handleHourChange = (day: string, type: 'start' | 'end', value: string) => {
        setFormHours(prev => ({
            ...prev,
            [`${day}_${type}`]: value
        }));
    };

    // Save Company Profile
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    company_name: companyName,
                    company_document: cnpj,
                    company_zip_code: zipCode,
                    company_address: address,
                    company_number: addressNumber,
                    company_complement: addressComplement,
                    company_phone: phone,
                    instagram,
                    website,
                    company_colors: { primary: primaryColor, secondary: secondaryColor },
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId as string);

            if (error) throw error;
            toast.success("Informações da empresa salvas!");
        } catch (error: any) {
            toast.error("Erro ao salvar perfil da empresa: " + error.message);
        } finally {
            setSavingProfile(false);
        }
    };

    // Image Processing & Upload
    const processAndUploadImage = async (file: File) => {
        if (!userId) return;

        try {
            setSavingProfile(true);

            // 1. HEIC Conversion if needed
            let processedFile = file;
            if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
                try {
                    const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
                    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
                } catch (e) {
                    toast.error("Erro ao converter imagem HEIC");
                    setSavingProfile(false);
                    return;
                }
            }

            // 2. Resize & Compress
            let finalFile: File;
            try {
                finalFile = await compressAndConvertToWebP(processedFile);
            } catch (error) {
                console.error("Erro na compressão (Company):", error);
                finalFile = processedFile;
            }

            // 3. Upload
            const fileExt = finalFile.name.split('.').pop();
            const fileName = `company_logo_${userId}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(`company/${fileName}`, finalFile, {
                    upsert: true,
                    contentType: finalFile.type
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(`company/${fileName}`);
            const publicUrlWithTimestamp = `${data.publicUrl}?t=${new Date().getTime()}`;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ company_logo_url: publicUrlWithTimestamp })
                .eq('id', userId as string);

            if (updateError) throw updateError;

            setLogoUrl(publicUrlWithTimestamp);
            toast.success("Logo da empresa atualizado!");

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Erro ao fazer upload da logo: " + error.message);
        } finally {
            setSavingProfile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            await processAndUploadImage(event.target.files[0]);
        }
    };

    // Address Lookup
    const handleZipCodeBlur = async () => {
        const cleanCep = zipCode.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setAddress(`${data.logradouro}, ${data.bairro}`);
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Formatters
    const formatCNPJ = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const formatCEP = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    };

    if (isLoadingHours) {
        return <div className="flex justify-center items-center h-full pt-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-4xl pb-20 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white hidden md:block">Minha Empresa</h1>
                <p className="text-slate-500 dark:text-slate-400">Gerencie as configurações da sua empresa, marca e horários.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Identidade Visual e Informações</CardTitle>
                        <CardDescription>Defina a logo, cores e dados principais da sua empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Logo & Basic Info */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Logo Upload */}
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className="relative group cursor-pointer w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden hover:border-yellow-500 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <Building2 className="w-8 h-8 mb-2" />
                                            <span className="text-xs font-medium">Upload Logo</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={onFileSelect}
                                    className="hidden"
                                    accept="image/*,.heic,.heif"
                                />
                                <p className="text-xs text-slate-500">Formato Retangular (PNG/JPG)</p>
                            </div>

                            {/* Info Fields */}
                            <div className="flex-1 space-y-4 w-full">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nome da Empresa</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                            placeholder="Nome fantasia"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">CNPJ</label>
                                    <input
                                        type="text"
                                        value={cnpj}
                                        onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                                        maxLength={18}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Colors */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Cores da Marca
                            </h4>
                            <div className="flex gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500">Cor Primária</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{primaryColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500">Cor Secundária</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                            className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{secondaryColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contato e Endereço</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Telefone / WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Instagram</label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="@suaempresa"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Site</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="www.suaempresa.com.br"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Address */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-sm font-medium">CEP</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                    <input
                                        type="text"
                                        value={zipCode}
                                        onChange={(e) => setZipCode(formatCEP(e.target.value))}
                                        onBlur={handleZipCodeBlur}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="00000-000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <label className="text-sm font-medium">Endereço</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                    placeholder="Rua, Avenida..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-sm font-medium">Número</label>
                                <input
                                    type="text"
                                    value={addressNumber}
                                    onChange={(e) => setAddressNumber(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <label className="text-sm font-medium">Complemento</label>
                                <input
                                    type="text"
                                    value={addressComplement}
                                    onChange={(e) => setAddressComplement(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                    placeholder="Sala, Andar, Galpão..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={savingProfile} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar Dados da Empresa
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>

            <Card>
                <CardHeader>
                    <CardTitle>Horários e Funcionamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <OperationalHoursForm
                        operationalHours={formHours as any}
                        selectedDays={selectedDays}
                        onDayToggle={handleDayToggle}
                        onHourChange={handleHourChange}
                        onSaveHours={handleSaveHours}
                        isSaving={savingHours}
                    />
                </CardContent>
            </Card>

            {/* ImageCropper removed */}
        </div>
    );
};
