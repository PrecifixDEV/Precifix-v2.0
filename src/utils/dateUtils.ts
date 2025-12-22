/**
 * Utilities for handling dates with timezone support.
 * 
 * Rules:
 * 1. Always store dates in UTC (ISO string).
 * 2. Always display dates in the user's local browser timezone.
 */

// Formats a UTC date string to the user's local timezone.
export const formatDate = (
    date: string | Date | null | undefined,
    options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    },
    locale: string = 'pt-BR'
): string => {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;

    // Invalid date check
    if (isNaN(d.getTime())) return '-';

    // Intl.DateTimeFormat uses the browser's default timezone automatically
    return new Intl.DateTimeFormat(locale, options).format(d);
};

// Formats just the date (DD/MM/YYYY)
export const formatLocalDate = (date: string | Date | null | undefined): string => {
    return formatDate(date, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Converts a local Date object (from a date picker, etc.) to a UTC ISO string for the DB.
export const toUTC = (date: Date): string => {
    return date.toISOString();
};

// Returns standard ISO date string for "today" in UTC (for default values if needed)
export const currentUTC = (): string => {
    return new Date().toISOString();
};
