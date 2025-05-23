import type { DateField } from "@prismicio/client";

export function formatDate(dateStr: DateField) : string{
    if(!dateStr) {
        return '';
    }
    const date = new Date(dateStr)

    const options: Intl.DateTimeFormatOptions = {
        // weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
}