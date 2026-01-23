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
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

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
    const [isDesktop, setIsDesktop] = React.useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true)

    // Sync when opening
    React.useEffect(() => {
        if (open) {
            setTempDate(date)
            if (date?.from) {
                setMonth(date.from)
            }
        }
    }, [open, date])

    // Detect screen size
    React.useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 768)
        }
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

    // Smart Presets
    const presets = React.useMemo(() => {
        const basePresets = [
            { label: "Hoje", getValue: () => ({ from: new Date(), to: new Date() }) },
            { label: "Ontem", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
            { label: "Últimos 7 dias", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
            { label: "Últimos 30 dias", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
            { label: "Este Mês", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
            { label: "Mês Passado", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
        ]
        return basePresets
    }, [])

    return (
        <div className={cn("grid gap-2", className)}>
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        size="icon"
                        className={cn(
                            "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors"
                        )}
                        title="Selecionar Período"
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="bg-zinc-900 border-zinc-800">
                    <div className="mx-auto w-full max-w-4xl">
                        <DrawerHeader className="border-b border-zinc-800">
                            <DrawerTitle className="text-center text-zinc-100 uppercase tracking-tight font-bold">
                                Selecionar Período
                            </DrawerTitle>
                        </DrawerHeader>
                        <div className="flex flex-col md:flex-row h-full max-h-[80vh] overflow-y-auto md:overflow-hidden p-4">
                            {/* Calendars */}
                            <div className="flex-1 flex justify-center p-2">
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
                                    className="bg-transparent"
                                />
                            </div>

                            {/* Sidebar / Presets */}
                            <div className="border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-900/50 p-4 flex flex-col justify-between min-w-[200px]">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                                        Períodos Rápidos
                                    </span>
                                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                                        {presets.map((preset) => (
                                            <Button
                                                key={preset.label}
                                                variant="ghost"
                                                size="sm"
                                                className="justify-start font-normal text-zinc-300 hover:text-primary hover:bg-primary/10"
                                                onClick={() => handlePresetSelect(preset.getValue())}
                                            >
                                                {preset.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-zinc-800">
                                    <Button onClick={handleApply} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider">
                                        <Check className="mr-2 h-4 w-4" /> Aplicar
                                    </Button>
                                    <Button onClick={handleCancel} variant="ghost" className="w-full text-zinc-400">
                                        <X className="mr-2 h-4 w-4" /> Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
