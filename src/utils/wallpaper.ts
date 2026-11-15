import { hslHex } from './theme';

export interface WallpaperPack {
  id: string;
  name: string;
  hue: number;
  css: string;
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

function rgbToHue(r: number, g: number, b: number): { hue: number; sat: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  if (d === 0) return { hue: 220, sat: 0 };
  const l = (max + min) / 2;
  const sat = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { hue: Math.round(((h * 60) + 360) % 360), sat };
}

export interface CustomWallpaperResult {
  dataUrl: string;
  hue: number;
}

export function processCustomWallpaperFile(file: File): Promise<CustomWallpaperResult> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const maxHeight = 1080;
        const scale = img.height > maxHeight ? maxHeight / img.height : 1;
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const sampleW = 24;
        const sampleH = 24;
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = sampleW;
        sampleCanvas.height = sampleH;
        const sctx = sampleCanvas.getContext('2d');
        let extractedHue = 220;
        if (sctx) {
          sctx.drawImage(img, 0, 0, sampleW, sampleH);
          const pixels = sctx.getImageData(0, 0, sampleW, sampleH).data;
          const bins = new Float64Array(36);
          for (let i = 0; i < pixels.length; i += 4) {
            const { hue, sat } = rgbToHue(pixels[i], pixels[i + 1], pixels[i + 2]);
            if (sat > 0.12) {
              const bucket = Math.floor(hue / 10) % 36;
              bins[bucket] += sat;
            }
          }
          let bestBucket = 22;
          let bestWeight = 0;
          for (let b = 0; b < 36; b++) {
            if (bins[b] > bestWeight) {
              bestWeight = bins[b];
              bestBucket = b;
            }
          }
          if (bestWeight > 0) extractedHue = bestBucket * 10 + 5;
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
        URL.revokeObjectURL(objectUrl);
        resolve({ dataUrl, hue: extractedHue });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image file'));
    };
    img.src = objectUrl;
  });
}
