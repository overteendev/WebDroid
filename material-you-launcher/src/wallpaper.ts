import { hslHex } from './theme';

export interface WallpaperPack {
  id: string;
  name: string;
  /** Seed hue the whole Material You palette is derived from. */
  hue: number;
  /** Ready-to-use CSS `background-image` value. */
  css: string;
  /** Small preview used by the wallpaper swatches in quick settings. */
  swatch: string;
}

function blob(id: string, hue: number, saturation: number, lightness: number): string {
  const color = hslHex(hue, saturation, lightness);
  return `<radialGradient id="${id}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${color}" stop-opacity="0.95"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}

function buildWallpaper(hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="base" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="${hslHex(hue, 40, 13)}"/>
        <stop offset="0.55" stop-color="${hslHex(hue + 16, 42, 7)}"/>
        <stop offset="1" stop-color="${hslHex(hue + 30, 40, 4)}"/>
      </linearGradient>
      ${blob('b1', hue + 10, 78, 46)}
      ${blob('b2', hue + 62, 70, 40)}
      ${blob('b3', hue - 46, 76, 38)}
      ${blob('b4', hue + 128, 72, 42)}
      <filter id="haze" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46"/></filter>
      <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    </defs>
    <rect width="400" height="860" fill="url(#base)"/>
    <g filter="url(#haze)">
      <ellipse cx="300" cy="130" rx="200" ry="190" fill="url(#b1)" opacity="0.85"/>
      <ellipse cx="80" cy="400" rx="200" ry="230" fill="url(#b2)" opacity="0.7"/>
      <ellipse cx="330" cy="640" rx="210" ry="240" fill="url(#b3)" opacity="0.75"/>
      <ellipse cx="60" cy="820" rx="230" ry="190" fill="url(#b4)" opacity="0.45"/>
    </g>
    <g filter="url(#soft)" opacity="0.6">
      <circle cx="292" cy="118" r="46" fill="url(#b2)"/>
      <circle cx="70" cy="392" r="34" fill="url(#b1)"/>
    </g>
    <rect width="400" height="860" filter="url(#grain)" opacity="0.05"/>
  </svg>`;

  const compact = svg.replace(/\n\s*/g, ' ').trim();
  return `url("data:image/svg+xml,${encodeURIComponent(compact)}")`;
}

function swatch(hue: number): string {
  return `linear-gradient(150deg, ${hslHex(hue, 62, 54)} 0%, ${hslHex(hue + 45, 56, 24)} 100%)`;
}

const definitions = [
  { id: 'aurora', name: 'Aurora', hue: 268 },
  { id: 'lagoon', name: 'Lagoon', hue: 196 },
  { id: 'ember', name: 'Ember', hue: 24 },
  { id: 'moss', name: 'Moss', hue: 142 },
];

export const wallpapers: WallpaperPack[] = definitions.map((definition) => ({
  ...definition,
  css: buildWallpaper(definition.hue),
  swatch: swatch(definition.hue),
}));
