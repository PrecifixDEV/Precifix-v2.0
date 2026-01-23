"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center w-full mb-4",
        caption_label: "text-sm font-bold font-sans uppercase tracking-[0.1em] text-white mx-10",
        nav: "flex items-center justify-between absolute w-full px-2",

        // Navigation Buttons
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100 text-white z-10"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100 text-white z-10"
        ),

        // Month Grid
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between mb-2 px-2",
        weekday: "text-zinc-600 rounded-md w-9 font-bold text-[0.65rem] uppercase tracking-wider text-center",

        // Lines and Days
        week: "flex w-full mt-1 justify-between",
        day: "h-9 w-9 text-center text-sm p-0 relative font-mono text-zinc-400 group [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent focus-within:relative focus-within:z-20",

        // Day Button
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-mono font-medium aria-selected:opacity-100 hover:bg-primary hover:text-black transition-all duration-200"
        ),

        // States and Modifiers
        range_end: "day-range-end",
        selected: "bg-primary text-black hover:bg-primary hover:text-black focus:bg-primary focus:text-black font-bold",
        today: "text-primary border-b-2 border-primary rounded-none",
        outside: "day-outside text-zinc-900 opacity-20",
        disabled: "text-zinc-800 opacity-20",
        range_middle: "aria-selected:bg-primary/20 aria-selected:text-primary font-bold",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
