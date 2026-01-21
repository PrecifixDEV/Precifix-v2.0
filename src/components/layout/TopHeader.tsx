import { Bell, ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/precifix-logo.png";

// Mapeamento de rotas para títulos
const PAGE_TITLES: Record<string, string> = {
    "/": "",
    "/cadastros/produtos": "Produtos",
    "/cadastros/servicos": "Serviços",
    "/cadastros/clientes": "Clientes",
    "/cadastros/formas-pagamento": "Formas de Pagamento",
    "/sales": "Vendas",
    "/schedule": "Agenda",
    "/financial": "Visão Geral",
    "/accounts": "Caixas e Bancos",
    "/accounts-payable": "Contas a Pagar",
    "/custos": "Gerenciar Despesas",
    "/profile": "Meu Perfil",
    "/minha-empresa": "Minha Empresa",
    "/settings": "Configurações",
    "/settings/categories": "Configurações",
    "/tools/dilution-calculator": "Ferramentas",
    "/tools/product-cost": "Ferramentas",
    "/ferramentas/calculadora-diluicao": "Ferramentas",
    "/menu": "Menu",
    "/profile-menu": "Perfil",
};

const ROOT_PATHS = ['/', '/menu', '/sales', '/profile', '/profile-menu'];

export function TopHeader() {
    const location = useLocation();
    const navigate = useNavigate();
    const pageTitle = PAGE_TITLES[location.pathname] || "Precifix";
    const isHome = location.pathname === "/";
    const showBackButton = !ROOT_PATHS.includes(location.pathname);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black border-b border-zinc-900 flex items-center justify-between px-4">
            {/* Left Section: Back Button (only if not root path) */}
            <div className="flex items-center w-10 z-20">
                {showBackButton && (
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white p-1 hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Center Section: Title OR Logo */}
            <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
                {isHome ? (
                    <img src={logo} alt="Precifix Logo" className="h-10 w-auto object-contain" />
                ) : (
                    <h1 className="text-2xl font-bold text-white whitespace-nowrap uppercase tracking-tight">{pageTitle}</h1>
                )}
            </div>

            {/* Right Section: Notifications */}
            <div className="flex items-center justify-end w-10 z-20">
                <button className="relative p-2 text-white hover:bg-zinc-800 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-zinc-950"></span>
                </button>
            </div>
        </header>
    );
}
