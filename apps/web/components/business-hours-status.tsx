'use client';
import { useEffect, useState } from 'react';
import { isWithinBusinessHours } from '../lib/business-hours';

export function BusinessHoursStatus() {
  const [withinHours, setWithinHours] = useState<boolean | null>(null);
  useEffect(() => {
    const update = () => setWithinHours(isWithinBusinessHours(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return <span className="header-availability" data-open={withinHours ?? undefined} aria-live="polite"><span aria-hidden="true" />{withinHours === null ? 'Hora de Chile' : withinHours ? 'En horario de atención' : 'Fuera de horario'}</span>;
}
