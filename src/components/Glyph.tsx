import { useEffect, useRef } from 'react';

export interface GlyphProps {
  name: string;
  size?: number;
  filled?: boolean;
  weight?: number;
  className?: string;
}

const SYMBOL_MAP: Record<string, string> = {
  wifi: 'wifi',
  bluetooth: 'bluetooth',
  dnd: 'do_not_disturb_on',
  flashlight: 'flashlight_on',
  airplane: 'airplanemode_active',
  battery: 'battery_5_bar',
  moon: 'dark_mode',
  rotate: 'screen_lock_rotation',
  sun: 'light_mode',
  search: 'search',
  mic: 'mic',
  close: 'close',
  back: 'arrow_back',
  chevron: 'keyboard_arrow_up',
  palette: 'palette',
  signal: 'signal_cellular_alt',
  calendar: 'calendar_today',
  settings: 'settings',
  mail: 'mail',
  music: 'music_note',
};

export function Glyph({
  name,
  size = 22,
  filled = false,
  weight = 400,
  className = '',
}: GlyphProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const symbolName = SYMBOL_MAP[name] ?? name;

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    el.style.setProperty('--glyph-size', `${size}px`);
    el.style.setProperty('--glyph-fill', filled ? '1' : '0');
    el.style.setProperty('--glyph-weight', String(weight));
  }, [size, filled, weight]);

  return (
    <span
      ref={spanRef}
      className={`material-symbols-rounded md3-glyph${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      {symbolName}
    </span>
  );
}
