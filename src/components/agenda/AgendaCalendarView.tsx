import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isToday
} from "date-fns";
import { cn } from "@/lib/utils";

interface AgendaCalendarViewProps {
    currentDate: Date;
}

export function AgendaCalendarView({ currentDate }: AgendaCalendarViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Mock data for status badges
    const getStatusMocks = (date: Date) => {
        const day = date.getDate();
        if (day % 7 === 0) return [{ label: "3 aprovados", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" }];
        if (day % 5 === 0) return [{ label: "1 aprovado", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" }, { label: "2 pendentes", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" }];
        if (day % 9 === 0) return [{ label: "1 cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" }];
        return [];
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/50">
                {weekDays.map((day) => (
                    <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {days.map((day, idx) => {
                    const isOutside = !isSameMonth(day, monthStart);
                    const isTodayCircle = isToday(day);
                    const status = getStatusMocks(day);

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[120px] p-2 border-r border-b border-zinc-800 transition-all hover:bg-zinc-800/30 group cursor-pointer",
                                idx % 7 === 6 && "border-r-0",
                                isOutside && "opacity-20 pointer-events-none"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                                    isTodayCircle ? "bg-primary text-black" : "text-zinc-400 group-hover:text-white"
                                )}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-auto">
                                {status.map((item, sIdx) => {
                                    const count = item.label.split(' ')[0];
                                    return (
                                        <div
                                            key={sIdx}
                                            className={cn(
                                                "min-w-[18px] h-[18px] flex items-center justify-center rounded text-[10px] font-black border tracking-tighter",
                                                item.color
                                            )}
                                            title={item.label}
                                        >
                                            {count}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
