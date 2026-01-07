import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBankByCode } from "@/constants/banks";
import { cn } from "@/lib/utils";

interface BankLogoProps {
    bankCode: string;
    bankName?: string;
    className?: string;
    showName?: boolean; // Option to render name next to logo
}

// Map bank codes to primary domains for logo fetching via Google Favicon API
const getBankDomain = (code: string) => {
    switch (code) {
        case '001': return 'bb.com.br';
        case '237': return 'bradesco.com.br';
        case '341': return 'itau.com.br';
        case '104': return 'caixa.gov.br';
        case '033': return 'santander.com.br';
        case '260': return 'nubank.com.br';
        case '077': return 'inter.co';
        case '336': return 'c6bank.com.br';
        case '212': return 'original.com.br';
        case '655': return 'neon.com.br';
        case '208': return 'btgpactual.com';
        case '422': return 'safra.com.br';
        case '756': return 'sicoob.com.br';
        case '748': return 'sicredi.com.br';
        case '623': return 'bancopan.com.br';
        case '290': return 'pagseguro.uol.com.br';
        case '380': return 'picpay.com';
        case '070': return 'brb.com.br';
        case '136': return 'unicred.com.br';
        case '097': return 'credz.com.br'; // or cooperativa
        default: return null;
    }
};

const getBankLogoUrl = (code: string) => {
    const domain = getBankDomain(code);
    if (!domain) return "";
    // Use Google S2 Favicon service - reliable and high quality
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

export const BankLogo = ({ bankCode, bankName, className, showName = false }: BankLogoProps) => {
    const bank = getBankByCode(bankCode);
    const logoUrl = getBankLogoUrl(bankCode);

    const displayName = bankName || bank?.shortName || bank?.name || "Banco";
    const initials = displayName.substring(0, 2).toUpperCase();
    const bgColor = bank?.color || "#64748b"; // Default slate-500

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <Avatar className={cn("h-10 w-10 border border-slate-100 dark:border-slate-800 bg-white shadow-sm", className)}>
                <AvatarImage
                    src={logoUrl}
                    alt={displayName}
                    className="object-contain p-1"
                />
                <AvatarFallback
                    className="text-white font-bold text-xs"
                    style={{ backgroundColor: bgColor }}
                >
                    {bankCode === '999' ? <span className="text-[10px]">R$</span> : initials}
                </AvatarFallback>
            </Avatar>
            {showName && (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    {displayName}
                </span>
            )}
        </div>
    );
};
