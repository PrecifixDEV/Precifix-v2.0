"use client"

import * as React from "react"
import { format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, RotateCcw, Check } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface SleekDateRangePickerProps {
    date?: DateRange
    onSelect: (date: DateRange | undefined) => void
    placeholder?: string
    className?: string
}

export function SleekDateRangePicker({
    date,
    onSelect,
    placeholder = "Selecionar período",
    className,
}: SleekDateRangePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [tempRange, setTempRange] = React.useState<DateRange | undefined>(date)
    const [month, setMonth] = React.useState<Date>(new Date())

    // Sincroniza o estado temporário quando o popover abre
    React.useEffect(() => {
        if (open) {
            setTempRange(date)
            if (date?.from) {
                setMonth(date.from)
            } else {
                setMonth(new Date())
            }
        }
    }, [open, date])

    const handleApply = () => {
        onSelect(tempRange)
        setOpen(false)
    }

    const handleReset = () => {
        setTempRange(undefined)
        setMonth(new Date())
    }

    const isRangeExceeded = React.useMemo(() => {
        if (tempRange?.from && tempRange?.to) {
            return differenceInDays(tempRange.to, tempRange.from) > 31
        }
        return false
    }, [tempRange])

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative w-full">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                "justify-start text-left font-normal pl-9",
                                !date && "text-muted-foreground",
                                className
                            )}
                        >
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                                        {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                                    </>
                                ) : (
                                    format(date.from, "dd/MM/yyyy", { locale: ptBR })
                                )
                            ) : (
                                <span>{placeholder}</span>
                            )}
                        </Button>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 bg-card border rounded-2xl overflow-hidden shadow-2xl"
                    align="start"
                >
                    <div className="flex flex-col">
                        <div className="p-4 pt-2">
                            <Calendar
                                initialFocus
                                mode="range"
                                month={month}
                                onMonthChange={setMonth}
                                selected={tempRange}
                                onSelect={(range) => {
                                    // Se o intervalo exceder 31 dias, não permitimos a seleção automática pelo prop 'max'
                                    // mas aqui fazemos uma validação visual extra se necessário.
                                    setTempRange(range)
                                }}
                                max={31} // react-day-picker v9 limit
                                numberOfMonths={1}
                                className="p-0"
                            />
                        </div>

                        {/* Footer com Botões - Compactado */}
                        <div className="flex items-center justify-between p-2 px-3 border-t border-zinc-900 bg-zinc-900/50">
                            <Button
                                variant="secondary-yellow"
                                size="sm"
                                onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 h-8 text-[10px] uppercase font-bold tracking-wider"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset
                            </Button>

                            <Button
                                size="sm"
                                onClick={handleApply}
                                disabled={isRangeExceeded} // Segurança extra
                                className="bg-primary text-black hover:bg-primary/90 font-bold px-4 flex items-center gap-1.5 h-8"
                            >
                                <Check className="h-4 w-4" />
                                Aplicar
                            </Button>
                        </div>

                        {isRangeExceeded && (
                            <div className="px-4 pb-3 text-center">
                                <p className="text-[10px] text-red-500 font-medium uppercase tracking-wider">
                                    Limite máximo de 31 dias atingido
                                </p>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
