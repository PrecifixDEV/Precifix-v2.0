import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { User, Camera, Loader2, Save } from 'lucide-react'
import { Card, Title, Text } from '@tremor/react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog"

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
                    setFirstName(data.first_name || user.user_metadata?.full_name?.split(' ')[0] || '')
                    setLastName(data.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '')
                    setCompanyName(data.company_name || '')
                    setDocumentNumber(data.document_number || '')
                    setZipCode(data.zip_code || '')
                    setAddress(data.address || '')
                    setAddressNumber(data.address_number || '')
                    setPhoneNumber(data.phone_number || '')
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
                first_name: firstName,
                last_name: lastName,
                company_name: companyName,
                document_number: documentNumber,
                zip_code: zipCode,
                address,
                address_number: addressNumber,
                phone_number: phoneNumber,
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) throw error

            // Update local user state for avatar/name in header
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName,
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

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setSaving(true)
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

            // Update profile with new avatar URL
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    avatar_url: data.publicUrl
                })

            if (updateError) throw updateError

            // Update auth metadata
            await supabase.auth.updateUser({
                data: { avatar_url: data.publicUrl }
            })

            setAvatarUrl(data.publicUrl)
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
                <Title className="text-slate-900 dark:text-white text-2xl font-bold">Meu Perfil</Title>
                <Text className="text-slate-500 dark:text-slate-400">
                    Gerencie suas informações pessoais e da empresa.
                </Text>
            </div>

            <Card className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
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
                            onChange={uploadAvatar}
                            className="hidden"
                            accept="image/*"
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
        </div>
    )
}
