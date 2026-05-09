const pad = (n: number) => String(n).padStart(2, '0');

export function formatReminderLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (dayDiff === 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Tomorrow at ${time}`;
  if (dayDiff === -1) return `Yesterday at ${time}`;
  if (dayDiff > 1 && dayDiff < 7) {
    return `${d.toLocaleDateString(undefined, { weekday: 'long' })} at ${time}`;
  }
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) + ` at ${time}`;
}

export function isoToDatePart(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isoToTimePart(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function combineDateAndTime(date: string, time: string): string | null {
  if (!date || !time) return null;
  const [y, m, day] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  if (!y || !m || !day || isNaN(h) || isNaN(min)) return null;
  return new Date(y, m - 1, day, h, min, 0, 0).toISOString();
}
