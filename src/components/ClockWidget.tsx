import { useEffect, useRef } from 'react';

export type ClockSize = 'md' | 'lg';

export interface ClockWidgetProps {
  compactDate: string;
  hours: number;
  minutes: number;
  seconds: number;
  size?: ClockSize;
}

export function ClockWidget({
  compactDate,
  hours,
  minutes,
  seconds,
  size = 'md',
}: ClockWidgetProps) {
  const dialRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<HTMLDivElement>(null);

  const dateChars = Array.from(compactDate);

  useEffect(() => {
    arcRef.current?.style.setProperty('--arc-len', String(dateChars.length));
  }, [dateChars.length]);

  useEffect(() => {
    const dial = dialRef.current;
    if (!dial) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      const secondDeg = seconds * 6;
      const minuteDeg = minutes * 6 + seconds * 0.1;
      const hourDeg = ((hours % 12) + minutes / 60) * 30;
      dial.style.setProperty('--hour-deg', `${hourDeg.toFixed(3)}deg`);
      dial.style.setProperty('--minute-deg', `${minuteDeg.toFixed(3)}deg`);
      dial.style.setProperty('--second-deg', `${secondDeg.toFixed(3)}deg`);
      return;
    }

    let rafId = 0;
    const tick = () => {
      const now = new Date();
      const s = now.getSeconds() + now.getMilliseconds() / 1000;
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;

      dial.style.setProperty('--hour-deg', `${(h * 30).toFixed(3)}deg`);
      dial.style.setProperty('--minute-deg', `${(m * 6).toFixed(3)}deg`);
      dial.style.setProperty('--second-deg', `${(s * 6).toFixed(3)}deg`);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [hours, minutes, seconds]);

  return (
    <div
      ref={dialRef}
      className={`md3-clock-dial scalloped${size === 'lg' ? ' lg' : ''}`}
      aria-label={`Material You analog clock, ${compactDate}`}
    >
      <div className="scalloped-plate" aria-hidden="true" />

      <div ref={arcRef} className="clock-arc-date" aria-hidden="true">
        {dateChars.map((char, index) => (
          <span key={`${index}-${char}`} className="clock-arc-char">
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>

      <span className="md3-hand md3-hand-hour" aria-hidden="true" />
      <span className="md3-hand md3-hand-minute" aria-hidden="true" />

      <div className="md3-second-orbit" aria-hidden="true">
        <span className="md3-second-dot" />
      </div>
    </div>
  );
}
