import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
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
    "/settings/categories": "Configurações",
    "/tools/dilution-calculator": "Calculadora de Diluição",
    "/ferramentas/calculadora-diluicao": "Calculadora de Diluição",
};

export function TopHeader() {
    const location = useLocation();
    const pageTitle = PAGE_TITLES[location.pathname] || "Precifix";
    const isHome = location.pathname === "/";

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4">
            {/* Logo ou Título */}
            {isHome ? (
                <img src={logo} alt="Precifix Logo" className="h-8 w-auto" />
            ) : (
                <h1 className="text-lg font-bold text-white">{pageTitle}</h1>
            )}

            {/* Notificações */}
            <button className="relative p-2 text-white hover:bg-slate-800 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-950"></span>
            </button>
        </header>
    );
}
