import { useRef, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Camera, Loader2, Save, User, ArrowRight, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ImageCropper } from '@/components/ImageCropper'
import heic2any from 'heic2any'

export const Profile = () => {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Alert Dialog State
    const [alertConfig, setAlertConfig] = useState({
        open: false,
        title: '',
        description: '',
        variant: 'default' as 'default' | 'destructive'
    })

    // Form states
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [nickname, setNickname] = useState('')
    const [documentNumber, setDocumentNumber] = useState('')
    const [zipCode, setZipCode] = useState('')
    const [address, setAddress] = useState('')
    const [addressNumber, setAddressNumber] = useState('')
    const [addressComplement, setAddressComplement] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    // Cropper State
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState<string | null>(null)

    useEffect(() => {
        getProfile()
    }, [])

    const getProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error && error.code !== 'PGRST116') {
                    throw error
                }

                if (data) {
                    setFirstName(data.first_name || '')
                    setLastName(data.last_name || '')
                    setNickname(data.nickname || '')
                    setDocumentNumber(data.document_number || '')
                    setPhoneNumber(data.phone_number || '')
                    setZipCode(data.zip_code || '')
                    setAddress(data.address || '')
                    setAddressNumber(data.address_number || '')
                    setAddressComplement(data.residential_complement || '')
                    setAvatarUrl(data.avatar_url)
                } else {
                    // Fallback using metadata if profile row missing
                    const fullName = user.user_metadata?.full_name || ''
                    const nameParts = fullName.split(' ')
                    setFirstName(nameParts[0] || '')
                    setLastName(nameParts.slice(1).join(' ') || '')
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error)
        } finally {
            setLoading(false)
        }
    }

    const showAlert = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
        setAlertConfig({
            open: true,
            title,
            description,
            variant
        })
    }

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user logged in')

            const updates = {
                id: user.id,
                email: user.email!,
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`.trim(), // Keep full_name for backward compatibility/search
                nickname: nickname,
                document_number: documentNumber,
                phone_number: phoneNumber,
                zip_code: zipCode,
                address: address,
                address_number: addressNumber,
                residential_complement: addressComplement,
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) throw error

            // Update local user state for avatar/name in header
            // If nickname is present, it might be used in header logic elsewhere, 
            // but usually header uses metadata or specific profile query.
            // Let's update metadata too just in case.
            // const displayName = nickname || firstName;

            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: `${firstName} ${lastName}`.trim(),
                    // Storing nickname in metadata could be useful too
                    nickname: nickname
                }
            })

            if (authError) throw authError

            showAlert('Sucesso', 'Perfil atualizado com sucesso!')
            window.dispatchEvent(new Event('profile-updated')); // Dispatch event to update header if listening
        } catch (error: any) {
            showAlert('Erro', 'Erro ao atualizar perfil: ' + error.message, 'destructive')
        } finally {
            setSaving(false)
        }
    }

    // ... (keep file handling logic mostly same)
    const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            let file = event.target.files[0]

            if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
                try {
                    setSaving(true)
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.8
                    })
                    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
                    file = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
                } catch (e) {
                    console.error("HEIC conversion failed", e)
                    showAlert('Erro', 'Falha ao processar imagem HEIC. Tente JPG/PNG.', 'destructive')
                    setSaving(false)
                    return
                } finally {
                    setSaving(false)
                }
            }

            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setImageToCrop(reader.result?.toString() || null)
                setCropModalOpen(true)
                if (fileInputRef.current) fileInputRef.current.value = ''
            })
            reader.readAsDataURL(file)
        }
    }

    const onCropComplete = async (croppedBlob: Blob) => {
        try {
            setSaving(true)
            setCropModalOpen(false)

            const fileExt = croppedBlob.type === 'image/webp' ? 'webp' : 'png'
            const fileName = `${user.id}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, croppedBlob, { upsert: true, contentType: croppedBlob.type })

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            const publicUrlWithTimestamp = `${data.publicUrl}?t=${new Date().getTime()}`

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email!,
                    avatar_url: publicUrlWithTimestamp
                })

            if (updateError) throw updateError

            await supabase.auth.updateUser({
                data: { avatar_url: publicUrlWithTimestamp }
            })

            setAvatarUrl(publicUrlWithTimestamp)
            showAlert('Sucesso', 'Avatar atualizado!')
            window.dispatchEvent(new Event('profile-updated'));
        } catch (error: any) {
            showAlert('Erro', 'Error uploading avatar: ' + error.message, 'destructive')
        } finally {
            setSaving(false)
        }
    }

    const handleZipCodeBlur = async () => {
        const cleanCep = zipCode.replace(/\D/g, '')
        if (cleanCep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
                const data = await response.json()
                if (!data.erro) {
                    setAddress(`${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`)
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error)
            }
        }
    }

    const formatCpf = (value: string) => {
        const cleaned = value.replace(/\D/g, '')
        return cleaned
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentNumber(formatCpf(e.target.value))
    }

    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '')
        return cleaned
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1')
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(formatPhoneNumber(e.target.value))
    }

    const formatCep = (value: string) => {
        const cleaned = value.replace(/\D/g, '')
        return cleaned
            .replace(/^(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1')
    }

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZipCode(formatCep(e.target.value))
    }

    if (loading) {
        return <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
    }

    const displayName = nickname || firstName;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white hidden md:block">Meu Perfil</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Gerencie suas informações pessoais.
                </p>
            </div>

            <Card className="shadow-sm">
                <CardContent className='pt-6'>
                    <form onSubmit={updateProfile} className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-slate-400">
                                            {displayName ? displayName[0].toUpperCase() : <User className="w-12 h-12" />}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileSelect}
                                className="hidden"
                                accept="image/*,.heic,.heif"
                            />
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                    {displayName} {nickname ? '' : lastName}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
                                    Informações Pessoais
                                </h4>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nome"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Sobrenome"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Apelido (Opcional)</label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="Como você gostaria de ser chamado?"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <p className="text-xs text-slate-500">Se preenchido, será usado na saudação inicial.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CPF</label>
                                    <input
                                        type="text"
                                        value={documentNumber}
                                        onChange={handleCpfChange}
                                        maxLength={14}
                                        placeholder="000.000.000-00"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        maxLength={15}
                                        placeholder="(XX) XXXXX-XXXX"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                                                </TooltipTrigger>
                                                <TooltipContent className='bg-slate-900 text-white border-slate-800'>
                                                    <p>Você pode alterar seu e-mail nas configurações da conta.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed outline-none"
                                    />
                                </div>
                            </div>

                            {/* Residential Address Info */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
                                    Endereço Residencial
                                </h4>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 col-span-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CEP</label>
                                        <input
                                            type="text"
                                            value={zipCode}
                                            onChange={handleCepChange}
                                            onBlur={handleZipCodeBlur}
                                            maxLength={9}
                                            placeholder="00000-000"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Endereço</label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 col-span-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número</label>
                                        <input
                                            type="text"
                                            value={addressNumber}
                                            onChange={(e) => setAddressNumber(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Complemento (Opcional)</label>
                                        <input
                                            type="text"
                                            value={addressComplement}
                                            onChange={(e) => setAddressComplement(e.target.value)}
                                            placeholder="Ex: Apto 101"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-background text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between w-full pt-4">
                            <button
                                type="button"
                                onClick={() => window.location.href = '/minha-empresa'}
                                className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                            >
                                <span>Minha Empresa</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <Button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5" // Optional: standard sizing might be fine, or override if needed
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <AlertDialog open={alertConfig.open} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertConfig.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => setAlertConfig(prev => ({ ...prev, open: false }))}
                            className={alertConfig.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                        >
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <ImageCropper
                open={cropModalOpen}
                imageSrc={imageToCrop}
                onClose={() => setCropModalOpen(false)}
                onCropComplete={onCropComplete}
            />
        </div>
    )
}
