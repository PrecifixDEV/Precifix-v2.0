"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Componente de Cabeçalho Customizado (Injetado via MonthCaption)
function CustomMonthCaption(props: any) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker()
  const currentMonth = props.calendarMonth.date

  return (
    <div className="relative flex items-center justify-center h-10 w-full mb-1">
      {/* Botão Anterior */}
      <button
        type="button"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-0 h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 text-white hover:bg-zinc-800 disabled:opacity-20 flex items-center justify-center z-20 transition-all"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Título Centralizado */}
      <span className="text-sm font-bold text-white uppercase tracking-[0.2em] font-sans flex items-center justify-center text-center">
        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
      </span>

      {/* Botão Próximo */}
      <button
        type="button"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-0 h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 text-white hover:bg-zinc-800 disabled:opacity-20 flex items-center justify-center z-20 transition-all"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("p-0 w-full max-w-[320px] mx-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full relative",

        // Escondemos os componentes nativos que estamos substituindo
        month_caption: "block", // Precisa estar visível para o CustomMonthCaption aparecer
        caption_label: "hidden",
        nav: "hidden",

        // GRID
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between mb-2",
        weekday: "text-zinc-500 w-8 font-normal text-[0.7rem] uppercase tracking-widest text-center",

        // DIAS
        week: "flex w-full mt-2 justify-between",
        day: cn(
          "h-8 w-8 p-0 font-normal transition-all duration-200 flex items-center justify-center",
          "text-center text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white focus:outline-none aria-selected:!text-black font-mono"
        ),

        day_button: "h-full w-full flex items-center justify-center rounded-md",

        // ESTADOS
        selected: "bg-primary !text-black hover:bg-primary hover:!text-black focus:bg-primary focus:!text-black font-bold shadow-md shadow-primary/20",
        today: "text-primary border border-primary/50 font-bold",
        outside: "day-outside text-zinc-700 opacity-50 aria-selected:bg-primary/50 aria-selected:text-black aria-selected:opacity-30",
        disabled: "text-zinc-700 opacity-50",
        range_start: "day-range-start rounded-l-md rounded-r-none bg-primary/80 !text-black",
        range_end: "day-range-end rounded-r-md rounded-l-none bg-primary/80 !text-black",
        range_middle: "aria-selected:bg-primary/20 aria-selected:!text-white rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        // A chave correta na v9 para substituir o conteúdo do topo é MonthCaption
        MonthCaption: CustomMonthCaption,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }