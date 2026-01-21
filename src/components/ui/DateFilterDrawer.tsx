"use client"

import * as React from "react"
import { format, addMonths, subMonths, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
} from "@/components/ui/drawer"

interface DateFilterDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    date?: DateRange
    onSelect: (date: DateRange | undefined) => void
}

export function DateFilterDrawer({
    open,
    onOpenChange,
    date,
    onSelect,
}: DateFilterDrawerProps) {
    const [month, setMonth] = React.useState<Date>(new Date())
    const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(date)

    // Sync state when drawer opens
    React.useEffect(() => {
        if (open) {
            setSelectedRange(date)
            if (date?.from) {
                setMonth(startOfMonth(date.from))
            } else {
                setMonth(startOfMonth(new Date()))
            }
        }
    }, [open, date])

    const handlePrevMonth = () => setMonth(subMonths(month, 1))
    const handleNextMonth = () => setMonth(addMonths(month, 1))

    const handleApply = () => {
        onSelect(selectedRange)
        onOpenChange(false)
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 z-[200]">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="pb-2">
                        <DrawerTitle className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-bold text-center">
                            Selecionar Período
                        </DrawerTitle>
                    </DrawerHeader>

                    {/* Custom Navigation Header */}
                    <div className="flex items-center justify-between px-6 py-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevMonth}
                            className="text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full w-10 h-10 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>

                        <div className="text-foreground font-black text-xl uppercase tracking-tighter">
                            {format(month, "MMMM yyyy", { locale: ptBR })}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextMonth}
                            className="text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full w-10 h-10 transition-colors"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="px-4 pb-4 flex justify-center">
                        <DayPicker
                            mode="range"
                            selected={selectedRange}
                            onSelect={setSelectedRange}
                            month={month}
                            onMonthChange={setMonth}
                            locale={ptBR}
                            showOutsideDays={false}
                            classNames={{
                                month: "space-y-4",
                                caption: "hidden",
                                month_caption: "hidden",
                                caption_label: "hidden",
                                nav: "hidden",
                                month_grid: "w-full border-collapse",
                                weekdays: "flex mb-2",
                                weekday: "text-muted-foreground w-10 font-bold text-[10px] uppercase text-center",
                                week: "flex w-full mt-1",
                                day: "h-10 w-10 text-center text-sm p-0 relative transition-all rounded-md flex items-center justify-center",
                                day_button: cn(
                                    "h-10 w-10 p-0 font-normal rounded-md transition-all flex items-center justify-center text-foreground/70 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-foreground"
                                ),
                                range_start: "bg-yellow-400 text-yellow-950 font-black rounded-md",
                                range_end: "bg-yellow-400 text-yellow-950 font-black rounded-md",
                                range_middle: "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 rounded-none",
                                selected: "bg-yellow-400 text-yellow-950",
                                today: "text-yellow-500 font-black underline",
                                outside: "opacity-0 pointer-events-none",
                                disabled: "text-muted-foreground/30 opacity-50",
                            }}
                        />
                    </div>

                    <DrawerFooter className="pt-2 pb-10 px-6">
                        <Button
                            onClick={handleApply}
                            className="mx-auto w-full max-w-[280px] h-10 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.98] shadow-md border-none rounded-lg"
                        >
                            APLICAR
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
