import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    icon?: React.ReactNode
    endIcon?: React.ReactNode
    onEndIconClick?: () => void
    labelClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, icon, endIcon, onEndIconClick, labelClassName, ...props }, ref) => {
        return (
            <div className="space-y-2 w-full">
                {label && <Label className={labelClassName}>{label}</Label>}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background dark:bg-zinc-950 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            icon ? "pl-10" : "",
                            endIcon ? "pr-10" : "",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {endIcon && (
                        <div
                            className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground", onEndIconClick && "cursor-pointer hover:text-foreground")}
                            onClick={onEndIconClick}
                        >
                            {endIcon}
                        </div>
                    )}
                </div>
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
