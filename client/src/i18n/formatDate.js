import { format } from 'date-fns';

export function formatDateParts(value, t) {
    const date = new Date(value);
    return {
        date: format(date, t('date.dateFormat')),
        time: format(date, t('date.timeFormat')),
    };
}
