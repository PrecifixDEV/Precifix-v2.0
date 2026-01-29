"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface SleekDatePickerProps {
    date?: Date
    onSelect: (date: Date | undefined) => void
    placeholder?: string
    className?: string
    disabled?: (date: Date) => boolean
}

export function SleekDatePicker({
    date,
    onSelect,
    placeholder = "Selecione uma data",
    className,
    disabled
}: SleekDatePickerProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <div className="relative w-full">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                            "flex h-10 w-full rounded-xl border border-input bg-background dark:bg-zinc-950 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                            "justify-start text-left font-normal pl-9 hover:bg-zinc-800/50 text-foreground",
                            !date && "text-muted-foreground transition-none",
                            className
                        )}
                    >
                        {date ? (
                            format(date, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0 bg-zinc-800 border-zinc-700 rounded-2xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8),0_0_20px_rgba(0,0,0,0.3)] z-[200]"
                align="start"
            >
                <div className="p-4 pt-2">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                            onSelect(newDate)
                            if (newDate) setOpen(false)
                        }}
                        disabled={disabled}
                        initialFocus
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
