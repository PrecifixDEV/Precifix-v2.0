import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { storageService, type StorageFile } from '@/services/storageService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2, FileIcon, ImageIcon } from 'lucide-react';
import { ConfirmDrawer } from '@/components/ui/confirm-drawer';
import { toast } from 'sonner';

export const MyFiles = () => {
    const [activeTab, setActiveTab] = useState('vehicle-images');
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Confirmation State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<StorageFile | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        if (userId) {
            loadFiles();
        }
    }, [userId, activeTab]);

    const loadFiles = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await storageService.listUserFiles(activeTab, userId);
            setFiles(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar arquivos.");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!fileToDelete || !userId) return;
        setDeleting(true);
        try {
            // 1. Delete from Storage
            await storageService.deleteFile(activeTab, fileToDelete.name);

            // 2. Cleanup DB Reference
            await storageService.cleanupReference(activeTab, fileToDelete.url, userId);

            toast.success("Arquivo excluído com sucesso.");

            // Refresh list
            setFiles(prev => prev.filter(f => f.name !== fileToDelete.name));
            setDeleteConfirmOpen(false);
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao excluir arquivo: " + error.message);
        } finally {
            setDeleting(false);
            setFileToDelete(null);
        }
    };

    const handleDeleteClick = (file: StorageFile) => {
        setFileToDelete(file);
        setDeleteConfirmOpen(true);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl pb-20 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white hidden md:block">Meus Arquivos</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Gerencie fotos e arquivos enviados para o sistema.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                    <TabsTrigger value="vehicle-images">Veículos</TabsTrigger>
                    <TabsTrigger value="product-images">Produtos</TabsTrigger>
                    <TabsTrigger value="avatars">Perfil</TabsTrigger>
                </TabsList>

                <div className="min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400">
                            <FileIcon className="w-12 h-12 mb-4 opacity-50" />
                            <p>Nenhum arquivo encontrado nesta categoria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {files.map((file) => (
                                <Card key={file.id} className="overflow-hidden group hover:shadow-lg transition-all border-zinc-200 dark:border-zinc-800">
                                    <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800">
                                        {/* Assuming mostly images for now */}
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback if not an image
                                                (e.target as HTMLImageElement).src = '';
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800" style={{ display: 'none' }}>
                                            <ImageIcon className="w-8 h-8 text-zinc-400" /> {/* Fallback icon - currently hidden unless img fails logic added properly */}
                                        </div>

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDeleteClick(file)}
                                                className="rounded-full w-10 h-10"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-3">
                                        <p className="text-xs text-zinc-500 truncate" title={file.name}>
                                            {file.name.split('/').pop()}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 mt-1">
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </Tabs>

            <ConfirmDrawer
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Excluir Arquivo?"
                description="Esta ação não pode ser desfeita. Se este arquivo estiver em uso (ex: foto de perfil), ele será removido."
                onConfirm={confirmDelete}
                confirmLabel={deleting ? "Excluindo..." : "Excluir"}
                variant="destructive"
                isLoading={deleting}
            />
        </div>
    );
};
