import { useEffect, useState } from 'react';

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const weekdayShortFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
});

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function timeText(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export interface ClockState {
  time: string;
  shortDate: string;
  longDate: string;
  compactDate: string;
  hours: number;
  minutes: number;
  seconds: number;
}

function readClockState(now: Date = new Date()): ClockState {
  return {
    time: timeText(now),
    shortDate: shortDateFormatter.format(now),
    longDate: longDateFormatter.format(now),
    compactDate: `${weekdayShortFormatter.format(now)} ${now.getDate()}`,
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  };
}

export function useClock(): ClockState {
  const [clock, setClock] = useState<ClockState>(() => readClockState());

  useEffect(() => {
    const update = () => setClock(readClockState());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return clock;
}
