import * as React from "react"
import { Input, type InputProps } from "@/components/ui/input"

export interface CurrencyInputProps extends Omit<InputProps, "value" | "onChange"> {
    value: number | string | undefined
    onValueChange: (value: number) => void
    max?: number
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, value, onValueChange, max, ...props }, ref) => {

        // Formatter for display
        const formatCurrency = (val: number) => {
            return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(val)
        }

        // Convert incoming value to number safely
        const numericValue = React.useMemo(() => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? 0 : parsed;
            }
            return 0;
        }, [value]);

        const [displayValue, setDisplayValue] = React.useState(formatCurrency(numericValue))

        // Sync external value changes to display
        React.useEffect(() => {
            setDisplayValue(formatCurrency(numericValue))
        }, [numericValue])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value

            // Remove everything that is not a digit
            const digits = inputValue.replace(/\D/g, "")

            // Convert to number (cents)
            const realValue = Number(digits) / 100

            if (max && realValue > max) return

            onValueChange(realValue)
            // display state will update via useEffect
        }

        return (
            <Input
                {...props}
                ref={ref}
                className={className}
                value={displayValue}
                onChange={handleChange}
                inputMode="numeric" // Mobile numeric keyboard
            />
        )
    }
)

CurrencyInput.displayName = "CurrencyInput"
