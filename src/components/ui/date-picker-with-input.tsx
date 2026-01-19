import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithInputProps {
    date?: Date
    setDate: (date: Date | undefined) => void
    className?: string
    placeholder?: string
}

export function DatePickerWithInput({
    date,
    setDate,
    className,
    placeholder = "Selecione uma data"
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
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <div className={cn("relative w-full", className)}>
                <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={cn("bg-white dark:bg-zinc-800", className)}
                    endIcon={
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-transparent"
                            >
                                <CalendarIcon className="h-4 w-4" />
                                <span className="sr-only">Abrir calendário</span>
                            </Button>
                        </PopoverTrigger>
                    }
                />
            </div>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                        setDate(selectedDate)
                        setIsOpen(false)
                    }}
                    initialFocus
                    locale={ptBR}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={2100}
                />
            </PopoverContent>
        </Popover>
    )
}
