import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function minutesToHHMM(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function hhmmToMinutes(hhmm: string): number {
    const [hours, mins] = hhmm.split(':').map(Number);
    if (isNaN(hours) || isNaN(mins)) return 0;
    return (hours * 60) + mins;
}
