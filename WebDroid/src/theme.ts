export type ThemeMode = 'light' | 'dark';

function clampChannel(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Modern CSS colour syntax, used for CSS custom properties. */
export function hsl(h: number, s: number, l: number, alpha = 1): string {
  const hue = ((h % 360) + 360) % 360;
  return `hsl(${hue} ${clampChannel(s, 0, 100)}% ${clampChannel(l, 0, 100)}% / ${alpha})`;
}

/** Hex colour, required by SVG presentation attributes inside the wallpaper data URI. */
export function hslHex(hue: number, saturation: number, lightness: number): string {
  const h = (((hue % 360) + 360) % 360) / 360;
  const s = clampChannel(saturation, 0, 100) / 100;
  const l = clampChannel(lightness, 0, 100) / 100;

  if (s === 0) {
    const gray = Math.round(l * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${gray}${gray}${gray}`;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const channel = (t: number): number => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };

  const toHex = (value: number): string =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(channel(h + 1 / 3))}${toHex(channel(h))}${toHex(channel(h - 1 / 3))}`;
}

function darkPalette(hue: number): Record<string, string> {
  return {
    '--primary': hsl(hue, 62, 80),
    '--on-primary': hsl(hue, 45, 16),
    '--primary-container': hsl(hue, 38, 30),
    '--on-primary-container': hsl(hue, 70, 90),
    '--secondary-container': hsl(hue, 16, 28),
    '--on-secondary-container': hsl(hue, 16, 90),
    '--surface': hsl(hue, 12, 6),
    '--surface-1': hsl(hue, 12, 9),
    '--surface-2': hsl(hue, 11, 12),
    '--surface-3': hsl(hue, 10, 16),
    '--on-surface': hsl(hue, 10, 93),
    '--surface-variant': hsl(hue, 10, 21),
    '--on-surface-variant': hsl(hue, 8, 76),
    '--outline': hsl(hue, 8, 48),
    '--outline-variant': hsl(hue, 9, 26),
    '--scrim': hsl(hue, 12, 3, 0.74),
  };
}

function lightPalette(hue: number): Record<string, string> {
  return {
    '--primary': hsl(hue, 55, 38),
    '--on-primary': hsl(hue, 40, 99),
    '--primary-container': hsl(hue, 72, 88),
    '--on-primary-container': hsl(hue, 55, 18),
    '--secondary-container': hsl(hue, 28, 90),
    '--on-secondary-container': hsl(hue, 22, 20),
    '--surface': hsl(hue, 30, 97),
    '--surface-1': hsl(hue, 28, 95),
    '--surface-2': hsl(hue, 26, 93),
    '--surface-3': hsl(hue, 24, 90),
    '--on-surface': hsl(hue, 14, 12),
    '--surface-variant': hsl(hue, 20, 88),
    '--on-surface-variant': hsl(hue, 12, 32),
    '--outline': hsl(hue, 8, 50),
    '--outline-variant': hsl(hue, 14, 78),
    '--scrim': hsl(hue, 20, 10, 0.42),
  };
}

/** Regenerates the whole Material You palette from a wallpaper hue. */
export function applyTheme(hue: number, mode: ThemeMode): void {
  const root = document.documentElement;
  const palette = mode === 'dark' ? darkPalette(hue) : lightPalette(hue);

  for (const [name, value] of Object.entries(palette)) {
    root.style.setProperty(name, value);
  }

  root.dataset.theme = mode;
  root.style.setProperty('color-scheme', mode);
}
