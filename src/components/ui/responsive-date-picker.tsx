"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

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

interface ResponsiveDatePickerProps {
    date?: Date
    onSelect: (date: Date | undefined) => void
    label?: string
    placeholder?: string
    className?: string
    disabled?: (date: Date) => boolean
}

export function ResponsiveDatePicker({
    date,
    onSelect,
    label = "Selecionar Data",
    placeholder = "Selecione uma data",
    className,
    disabled
}: ResponsiveDatePickerProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-white transition-all",
                        !date && "text-zinc-500",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
                    {date ? (
                        format(date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-zinc-900 border-zinc-800">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="border-b border-zinc-800 pb-4">
                        <DrawerTitle className="text-center text-zinc-100 uppercase tracking-tight font-bold">
                            {label}
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(newDate) => {
                                onSelect(newDate)
                                setOpen(false)
                            }}
                            disabled={disabled}
                            initialFocus
                            locale={ptBR}
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={2100}
                            className="bg-transparent"
                        />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
