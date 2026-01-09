import * as React from "react"
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
    className?: string
    date: DateRange | undefined
    setDate: (date: DateRange | undefined) => void
}

export function DateRangePicker({
    className,
    date,
    setDate,
}: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false)

    const presets = [
        {
            label: 'Hoje',
            getValue: () => ({ from: new Date(), to: new Date() })
        },
        {
            label: 'Ontem',
            getValue: () => {
                const yesterday = subDays(new Date(), 1);
                return { from: yesterday, to: yesterday };
            }
        },
        {
            label: 'Últimos 7 dias',
            getValue: () => ({ from: subDays(new Date(), 7), to: new Date() })
        },
        {
            label: 'Últimos 30 dias',
            getValue: () => ({ from: subDays(new Date(), 30), to: new Date() })
        },
        {
            label: 'Este Mês',
            getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
        },
        {
            label: 'Mês Passado',
            getValue: () => {
                const lastMonth = subMonths(new Date(), 1);
                return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
            }
        },
    ];

    const handlePresetSelect = (preset: typeof presets[0]) => {
        const newDate = preset.getValue();
        setDate(newDate);
        // Keep open or close based on preference? Usually close after preset selection is nice, 
        // but maybe user wants to see what was selected. Let's keep it open to be safe or close it. 
        // The requirement didn't specify, but often presets auto-close or update calendar.
        // Let's update and keep open so they can verify.
    }

    // Effect to snap to preset if date matches exactly could be complex, 
    // so we just show the date in the trigger.

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal bg-slate-50 dark:bg-slate-900/50 border-none",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
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
                            <span>Selecione um período</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <div className="flex flex-col sm:flex-row">
                        <div className="flex flex-col gap-1 p-2 border-r border-slate-200 dark:border-slate-800 min-w-[140px]">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="ghost"
                                    className="justify-start font-normal"
                                    onClick={() => handlePresetSelect(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                        <div className="p-2">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                locale={ptBR}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
