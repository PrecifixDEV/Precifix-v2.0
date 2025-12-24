import { useRef, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Camera, Loader2, Save, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog"
import { ImageCropper } from '@/components/ImageCropper'
import heic2any from 'heic2any'

export const Profile = () => {
    // ... (keep state)
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

    // ... (keep existing code)
    // ...
    // ...



    // Form states
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [documentNumber, setDocumentNumber] = useState('')
    const [zipCode, setZipCode] = useState('')
    const [address, setAddress] = useState('')
    const [addressNumber, setAddressNumber] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    // Cropper State
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState<string | null>(null)

    useEffect(() => {
        getProfile()
    }, [])

    const getProfile = async () => {
        // ... (existing getProfile)
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
                    const fullName = data.full_name || user.user_metadata?.full_name || '';
                    const nameParts = fullName.split(' ');
                    setFirstName(nameParts[0] || '');
                    setLastName(nameParts.slice(1).join(' ') || '');
                    setCompanyName(data.company_name || '')
                    setDocumentNumber(data.cpf_cnpj || '')
                    setPhoneNumber(data.mobile_phone || '')
                    // Address fields not in DB
                    setZipCode('')
                    setAddress('')
                    setAddressNumber('')
                    setAvatarUrl(data.avatar_url)
                } else {
                    // Fallback if no profile row exists yet
                    setFirstName(user.user_metadata?.full_name?.split(' ')[0] || '')
                    setLastName(user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '')
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
                email: user.email!, // Required by schema
                full_name: `${firstName} ${lastName}`.trim(),
                company_name: companyName,
                cpf_cnpj: documentNumber, // Mapped from document_number
                mobile_phone: phoneNumber, // Mapped from phone_number
                // Address fields removed as they don't exist in 'profiles' table yet
                // zip_code: zipCode,
                // address: address,
                // number: addressNumber, 
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) throw error

            // Update local user state for avatar/name in header
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: `${firstName} ${lastName}`.trim(),
                }
            })

            if (authError) throw authError

            showAlert('Sucesso', 'Perfil atualizado com sucesso!')
        } catch (error: any) {
            showAlert('Erro', 'Erro ao atualizar perfil: ' + error.message, 'destructive')
        } finally {
            setSaving(false)
        }
    }

    const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            let file = event.target.files[0]

            // Check for HEIC
            if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
                try {
                    setSaving(true) // Show global loading while converting
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.8
                    })

                    // heic2any can return Blob or Blob[], handle both
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
                // Reset file input so user can select same file again if they cancel
                if (fileInputRef.current) fileInputRef.current.value = ''
            })
            reader.readAsDataURL(file)
        }
    }

    const onCropComplete = async (croppedBlob: Blob) => {
        try {
            setSaving(true)
            setCropModalOpen(false)

            const fileName = `${user.id}.png` // Always PNG for consistency/transparency
            const filePath = `${fileName}`

            // Overwrite existing file
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, croppedBlob, { upsert: true, contentType: 'image/png' })

            if (uploadError) throw uploadError

            // Get public URL (sometimes caching issues occur, adding timestamp query param might help UI but DB should be clean)
            // For now, simpler is better.
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

            // Add Timestamp to bust client cache immediately
            const publicUrlWithTimestamp = `${data.publicUrl}?t=${new Date().getTime()}`

            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email!,
                    avatar_url: publicUrlWithTimestamp
                })

            if (updateError) throw updateError

            // Update auth metadata
            await supabase.auth.updateUser({
                data: { avatar_url: publicUrlWithTimestamp }
            })

            setAvatarUrl(publicUrlWithTimestamp)
            showAlert('Sucesso', 'Avatar atualizado!')
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
                    setAddress(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`)
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error)
            }
        }
    }

    // Format CPF or CNPJ
    const formatCpfCnpj = (value: string) => {
        const cleaned = value.replace(/\D/g, '')

        if (cleaned.length <= 11) {
            return cleaned
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1')
        }

        return cleaned
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCpfCnpj(e.target.value)
        setDocumentNumber(formatted)
    }

    // Format Phone Number
    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '')
        return cleaned
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1')
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value)
        setPhoneNumber(formatted)
    }

    // Format CEP
    const formatCep = (value: string) => {
        const cleaned = value.replace(/\D/g, '')
        return cleaned
            .replace(/^(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1')
    }

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCep(e.target.value)
        setZipCode(formatted)
    }

    if (loading) {
        return <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Gerencie suas informações pessoais e da empresa.
                </p>
            </div>

            <Card className="bg-white dark:bg-slate-900 shadow-sm">
                <CardContent>
                    <form onSubmit={updateProfile} className="space-y-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-slate-400">
                                            {firstName ? firstName[0].toUpperCase() : <User className="w-12 h-12" />}
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
                                    {firstName || 'Seu Nome'} {lastName}
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
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sobrenome</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">CPF/CNPJ</label>
                                    <input
                                        type="text"
                                        value={documentNumber}
                                        onChange={handleDocumentChange}
                                        maxLength={18}
                                        placeholder="CPF ou CNPJ"
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
                            </div>

                            {/* Company/Address Info */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
                                    Endereço e Empresa
                                </h4>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Empresa</label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>

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
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Endereço</label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número / Complemento</label>
                                    <input
                                        type="text"
                                        value={addressNumber}
                                        onChange={(e) => setAddressNumber(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
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
