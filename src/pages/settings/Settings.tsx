import { Link } from 'react-router-dom';
import { Tag, Package, ChevronRight } from 'lucide-react';

export default function Settings() {

    const settingsItems = [
        {
            title: 'Categorias Financeiras',
            description: 'Gerencie categorias de receitas e despesas',
            icon: Tag,
            href: '/settings/categories',
            color: 'bg-blue-900/30 text-blue-400'
        },
        {
            title: 'Meus Arquivos',
            description: 'Gerencie fotos, produtos e documentos',
            icon: Package,
            href: '/settings/files',
            color: 'bg-yellow-900/30 text-yellow-400'
        }
    ];

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-6 animate-in fade-in duration-500">


            <div className="hidden md:block mb-6">
                <h1 className="text-3xl font-bold text-white">Configurações</h1>
                <p className="text-zinc-400 mt-2">Gerencie as preferências e ajustes do sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settingsItems.map((item) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className="group flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${item.color}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-primary transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
