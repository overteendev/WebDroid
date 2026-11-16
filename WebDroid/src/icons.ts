/** 24x24, stroke-based glyphs. `fill="currentColor"` marks solid details. */
const glyphs: Record<string, string> = {
  /* --- system / UI --- */
  wifi:
    '<path d="M2.6 8.6a13.4 13.4 0 0 1 18.8 0"/><path d="M5.9 12.3a9 9 0 0 1 12.2 0"/><path d="M9.2 16a4.4 4.4 0 0 1 5.6 0"/><circle cx="12" cy="19.4" r="1.2" fill="currentColor" stroke="none"/>',
  bluetooth: '<path d="M7 7.6l10 8.4-5 4V4l5 4-10 8.4"/>',
  dnd: '<circle cx="12" cy="12" r="8.6"/><path d="M8.4 12h7.2"/>',
  flashlight: '<path d="M9 3h6v3.6l-2 2.6V21h-2V9.2L9 6.6z"/><path d="M9.4 6.6h5.2"/>',
  airplane:
    '<path d="M21 15.8v-1.9l-7.8-4.9V3.6a1.4 1.4 0 0 0-2.8 0V9l-7.9 4.9v1.9l7.9-2.5v5.1l-2.2 1.6v1.5l3.6-1 3.6 1v-1.5l-2.2-1.6v-5.1z"/>',
  battery:
    '<rect x="2.4" y="7.6" width="16.8" height="8.8" rx="2.6"/><rect x="4.6" y="9.8" width="10.4" height="4.4" rx="1.4" fill="currentColor" stroke="none"/><path d="M21.2 10.6v2.8"/>',
  moon: '<path d="M20 14.4A8.5 8.5 0 0 1 9.6 4 8.5 8.5 0 1 0 20 14.4z"/>',
  rotate: '<path d="M20.5 9.4A8.6 8.6 0 1 0 21 14.2"/><path d="M21 4.4v5h-5"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"/>',
  power: '<path d="M12 3.2v8.6"/><path d="M7.9 6.5a7 7 0 1 0 8.2 0"/>',
  search: '<circle cx="11" cy="11" r="6.4"/><path d="M15.8 15.8l4.4 4.4"/>',
  mic: '<rect x="9.2" y="3" width="5.6" height="10.4" rx="2.8"/><path d="M6 11.4a6 6 0 0 0 12 0"/><path d="M12 17.4V21M9.4 21h5.2"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M6 10l6 6 6-6"/>',
  palette:
    '<path d="M12 3.2c-4.9 0-8.8 3.5-8.8 8 0 4.3 3.4 6.9 6.6 6.9 1.3 0 2.1-.8 2.1-1.9 0-1.1-.9-1.6-.9-2.7 0-1 .9-1.8 2-1.8h2.4c2.6 0 4.6-1.6 4.6-4 0-2.8-3-5.5-8-5.5z"/><circle cx="8.2" cy="10.4" r=".9" fill="currentColor" stroke="none"/><circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none"/><circle cx="15.8" cy="9.6" r=".9" fill="currentColor" stroke="none"/>',
  signal: '<path d="M4 20v-4.6M9.3 20v-8.4M14.6 20V7.4M20 20V3.6"/>',

  /* --- web apps --- */
  mail: '<rect x="3" y="5" width="18" height="14" rx="3.2"/><path d="M4.4 7.6l6.8 5a1.4 1.4 0 0 0 1.6 0l6.8-5"/>',
  play: '<rect x="2.6" y="5.4" width="18.8" height="13.2" rx="4.2"/><path d="M10.2 9.4l5 2.6-5 2.6z" fill="currentColor" stroke="none"/>',
  pin: '<path d="M12 21c3.8-4 6.4-7.3 6.4-10.4a6.4 6.4 0 1 0-12.8 0C5.6 13.7 8.2 17 12 21z"/><circle cx="12" cy="10.4" r="2.4"/>',
  chat: '<path d="M20.6 11.6A8.4 8.4 0 0 1 8.4 18.9L3.4 20.4l1.6-5A8.4 8.4 0 1 1 20.6 11.6z"/><circle cx="8.6" cy="11.6" r="1" fill="currentColor" stroke="none"/><circle cx="12.2" cy="11.6" r="1" fill="currentColor" stroke="none"/><circle cx="15.8" cy="11.6" r="1" fill="currentColor" stroke="none"/>',
  globe:
    '<circle cx="12" cy="12" r="8.8"/><path d="M3.4 12h17.2"/><path d="M12 3.2c2.6 3 2.6 14 0 17.6M12 3.2c-2.6 3-2.6 14 0 17.6"/>',
  calendar:
    '<rect x="3.2" y="5" width="17.6" height="16" rx="3.2"/><path d="M3.2 10h17.6M8.2 3v4M15.8 3v4"/><path d="M7.6 14h3v3h-3z" fill="currentColor" stroke="none"/>',
  cloud: '<path d="M7.2 18.4h9.6a4.2 4.2 0 0 0 .5-8.4 6.2 6.2 0 0 0-11.7 1.4 3.6 3.6 0 0 0 1.6 7z"/>',
  photos:
    '<circle cx="12" cy="12" r="3.2"/><path d="M12 8.8V4.2M12 19.8v-4.6M15.2 12h4.6M4.2 12h4.6M9.7 9.7L6.5 6.5M17.5 17.5l-3.2-3.2M14.3 9.7l3.2-3.2M6.5 17.5l3.2-3.2"/>',
  music: '<path d="M9.2 18V6.6L19 4.2v11.4"/><circle cx="6.6" cy="18" r="2.6"/><circle cx="16.4" cy="15.6" r="2.6"/>',
  plane: '<path d="M21.4 3.6L2.8 10.9l6 2.1 2.2 6.4z"/><path d="M8.8 13L21.4 3.6"/>',
  camera:
    '<rect x="2.8" y="6.2" width="18.4" height="13.6" rx="4"/><circle cx="12" cy="13" r="4"/><circle cx="17.6" cy="9.4" r=".9" fill="currentColor" stroke="none"/>',
  x: '<path d="M5 4.4l14 15.2M19 4.4L5 19.6"/>',
  code: '<path d="M8.6 7L4 12l4.6 5M15.4 7L20 12l-4.6 5"/>',
  spark: '<path d="M12 3.2l2.3 6.5 6.5 2.3-6.5 2.3L12 20.8l-2.3-6.5L3.2 12l6.5-2.3z"/>',
  doc: '<rect x="4.4" y="3" width="15.2" height="18" rx="3"/><path d="M8.4 9h7.2M8.4 13h7.2M8.4 17h4.4"/>',
  bubble:
    '<circle cx="12" cy="12" r="8.8"/><circle cx="9.2" cy="11.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.8" cy="11.2" r="1.1" fill="currentColor" stroke="none"/><path d="M8.8 14.6a4 4 0 0 0 6.4 0"/>',
  controller:
    '<rect x="2.6" y="7.4" width="18.8" height="10.6" rx="5.3"/><path d="M8 10.8v4M6 12.8h4"/><circle cx="16" cy="11.6" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="14" r="1" fill="currentColor" stroke="none"/>',
  bag: '<path d="M4.6 8.2h14.8L17.8 20H6.2z"/><path d="M8.6 8.2V6.4a3.4 3.4 0 0 1 6.8 0v1.8"/>',
  netflix: '<path d="M6.4 3h3.9l4.1 10.6V3h3.2v18h-3.9L9.6 10.2V21H6.4z" fill="currentColor" stroke="none"/>',
  dot: '<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',
};

export function glyph(name: string, size = 22, strokeWidth = 2): string {
  const shape = glyphs[name] ?? glyphs.dot;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shape}</svg>`;
}
