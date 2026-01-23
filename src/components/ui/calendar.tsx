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
      captionLayout="dropdown"
      fromYear={1900}
      toYear={2100}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium hidden", // Hide this one (legacy text?)
        month_caption: "flex justify-center items-center grow", // Keep this visible (dropdowns container?)
        dropdowns: "flex justify-center gap-1 w-full text-center",
        nav: "contents", // Changed to contents to allow buttons to participate in caption flex

        // Botões de navegação (Nav Buttons)
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 order-first" // Removed absolute, added order-first
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 order-last" // Removed absolute, added order-last
        ),

        // Month Grid
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",

        // Lines and Days
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative font-mono [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",

        // Day Button
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-mono font-normal aria-selected:opacity-100 hover:bg-primary hover:text-primary-foreground"
        ),

        // States and Modifiers
        range_end: "day-range-end",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-[0_0_15px_rgba(250,204,21,0.3)]",
        today: "bg-zinc-800 text-primary border border-primary/20",
        outside: "day-outside text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",

        // Dropdowns (Styling for captionLayout="dropdown")
        caption_dropdowns: "flex gap-2 items-center justify-center font-mono",
        dropdown: "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white h-8 rounded-md px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary font-mono",
        dropdown_icon: "hidden",

        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" {...props} />
          }
          return <ChevronRight className="h-4 w-4" {...props} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
