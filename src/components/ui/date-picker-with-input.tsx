import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

interface DatePickerWithInputProps {
    date?: Date
    setDate: (date: Date | undefined) => void
    className?: string
    placeholder?: string
    label?: string
}

export function DatePickerWithInput({
    date,
    setDate,
    className,
    placeholder = "Selecione uma data",
    label = "Selecionar Data"
}: DatePickerWithInputProps) {
    const [inputValue, setInputValue] = React.useState("")
    const [isOpen, setIsOpen] = React.useState(false)

    // Sync input value when date prop changes
    React.useEffect(() => {
        if (date) {
            setInputValue(format(date, "P", { locale: ptBR }))
        } else {
            setInputValue("")
        }
    }, [date])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)

        if (value.trim() === "") {
            setDate(undefined)
            return
        }

        // Try to parse the date
        // "P" format in pt-BR is dd/MM/yyyy
        const parsedDate = parse(value, "P", new Date(), { locale: ptBR })

        if (isValid(parsedDate)) {
            setDate(parsedDate)
        }
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <div className={cn("relative w-full", className)}>
                <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={cn("bg-zinc-900 border-zinc-800 text-white", className)}
                    endIcon={
                        <DrawerTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-transparent"
                            >
                                <CalendarIcon className="h-4 w-4" />
                                <span className="sr-only">Abrir calendário</span>
                            </Button>
                        </DrawerTrigger>
                    }
                />
            </div>
            <DrawerContent className="bg-black border-zinc-900">
                <div className="mx-auto w-full max-w-sm pb-8">
                    <DrawerHeader>
                        <DrawerTitle className="text-center text-zinc-600 uppercase tracking-[0.2em] font-bold text-[0.65rem] mb-2">
                            {label}
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                                setDate(selectedDate)
                                if (selectedDate) setIsOpen(false)
                            }}
                            initialFocus
                            locale={ptBR}
                            className="bg-transparent"
                        />
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
