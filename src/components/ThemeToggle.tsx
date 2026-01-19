import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="flex items-center justify-center p-2">
            <div className="relative flex w-full max-w-[200px] items-center rounded-full border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                <div
                    className={cn(
                        "absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-all duration-200 dark:bg-zinc-800",
                        theme === "dark" ? "left-[50%]" : "left-1"
                    )}
                />
                <button
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className={cn(
                        "z-10 flex w-1/2 items-center justify-center gap-2 rounded-full py-1.5 text-sm font-medium transition-colors",
                        theme === "light"
                            ? "text-zinc-900"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                >
                    <Sun className="h-4 w-4" />
                    <span className="sr-only">Light</span>
                </button>
                <button
                    onClick={() => theme === 'light' && toggleTheme()}
                    className={cn(
                        "z-10 flex w-1/2 items-center justify-center gap-2 rounded-full py-1.5 text-sm font-medium transition-colors",
                        theme === "dark"
                            ? "text-white"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                >
                    <Moon className="h-4 w-4" />
                    <span className="sr-only">Dark</span>
                </button>
            </div>
        </div>
    )
}
