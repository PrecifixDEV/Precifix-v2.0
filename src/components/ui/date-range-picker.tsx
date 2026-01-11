"use client"

import * as React from "react"
import { startOfMonth, endOfMonth, subDays, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Check, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
    className?: string
}

export function DateRangePicker({
    date,
    setDate,
    className,
}: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date)
    const [month, setMonth] = React.useState<Date>(new Date())
    const [isDesktop, setIsDesktop] = React.useState(window.innerWidth >= 768)

    // Sincroniza ao abrir
    React.useEffect(() => {
        if (open) {
            setTempDate(date)
            if (date?.from) {
                setMonth(date.from)
            }
        }
    }, [open, date])

    // Detectar tamanho da tela para responsividade
    React.useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 768)
        }

        // Check initial logic safely (already initialized above but good to be explicit for hydration if needed, though this is client comp)
        // Add listener
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])


    const handleApply = () => {
        setDate(tempDate)
        setOpen(false)
    }

    const handleCancel = () => {
        setOpen(false)
    }

    const handlePresetSelect = (presetValue: DateRange) => {
        setTempDate(presetValue)
        if (presetValue.from) {
            setMonth(presetValue.from)
        }
    }

    // Presets Inteligentes
    const presets = React.useMemo(() => {
        if (isDesktop) {
            return [
                { label: "Hoje", getValue: () => ({ from: new Date(), to: new Date() }) },
                { label: "Ontem", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
                { label: "Últimos 7 dias", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
                { label: "Últimos 30 dias", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
                { label: "Este Mês", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
                { label: "Mês Passado", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
            ]
        }
        return [
            { label: "Hoje", getValue: () => ({ from: new Date(), to: new Date() }) },
            { label: "Ontem", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
            { label: "7d atrás", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
            { label: "30d atrás", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
            { label: "Este Mês", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
        ]
    }, [isDesktop])

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        size="icon"
                        className={cn(
                            "bg-slate-50 dark:bg-slate-900/50 border-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        )}
                        title="Selecionar Período"
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col md:flex-row h-full max-h-[80vh] overflow-y-auto md:overflow-hidden">
                        {/* Calendários */}
                        <div className="p-3">
                            <Calendar
                                mode="range"
                                defaultMonth={month}
                                month={month}
                                onMonthChange={setMonth}
                                selected={tempDate}
                                onSelect={setTempDate}
                                numberOfMonths={isDesktop ? 2 : 1}
                                locale={ptBR}
                                captionLayout="dropdown"
                                fromYear={2020}
                                toYear={2030}
                                classNames={!isDesktop ? {
                                    button_previous: "hidden",
                                    button_next: "hidden"
                                } : undefined}
                            />
                        </div>

                        {/* Sidebar Direita */}
                        <div className="border-t md:border-t-0 md:border-l border-border bg-muted/5 p-3 flex flex-col justify-between min-w-[160px]">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    Períodos Rápidos
                                </span>
                                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                                    {presets.map((preset) => (
                                        <Button
                                            key={preset.label}
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start font-normal"
                                            onClick={() => handlePresetSelect(preset.getValue())}
                                        >
                                            {preset.label}
                                        </Button>
                                    ))}
                                    {/* Botões de Ação Mobiles (Dentro do Grid para economizar espaço) */}
                                    {!isDesktop && (
                                        <div className="flex gap-1 items-center">
                                            <Button onClick={handleApply} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={handleCancel} variant="ghost" size="sm" className="flex-1">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Botões de Ação Desktop (Mantidos no rodapé) */}
                            {isDesktop && (
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                                    <Button onClick={handleApply} size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                        <Check className="mr-2 h-3 w-3" /> Aplicar
                                    </Button>
                                    <Button onClick={handleCancel} variant="ghost" size="sm" className="w-full">
                                        <X className="mr-2 h-3 w-3" /> Cancelar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
