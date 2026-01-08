import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBankByCode } from "@/constants/banks";
import { cn } from "@/lib/utils";

interface BankLogoProps {
    bankCode: string;
    bankName?: string;
    className?: string;
    showName?: boolean; // Option to render name next to logo
    fullBleed?: boolean; // Option to scale image for popovers
}

// Generate local path for bank logos based on bank code
const getBankLogoUrl = (code: string) => {
    // Sanitize code to remove any non-alphanumeric characters (just in case)
    const safeCode = code.replace(/[^a-zA-Z0-9]/g, "");
    return `/icons/banks/${safeCode}.svg`;
};

export const BankLogo = ({ bankCode, bankName, className, showName = false, fullBleed = false }: BankLogoProps) => {
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
                    className={cn(
                        "transition-transform",
                        fullBleed ? "h-full w-full object-cover scale-110" : "object-contain p-1"
                    )}
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
