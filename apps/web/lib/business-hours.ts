// Hours supplied by the owner. Always evaluate in the user's Chilean timezone.
export const businessHours = { timeZone: 'America/Santiago', label: 'Lun–Vie · 08:00–20:00', opens: 8, closes: 20 } as const;

export function isWithinBusinessHours(date: Date): boolean {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: businessHours.timeZone, weekday: 'short', hour: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const weekday = parts.find(part => part.type === 'weekday')?.value;
  const hour = Number(parts.find(part => part.type === 'hour')?.value);
  return weekday !== undefined && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday) && hour >= businessHours.opens && hour < businessHours.closes;
}
