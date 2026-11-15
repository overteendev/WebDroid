export interface AppDef {
  id: string;
  name: string;
  /** Web app opened in a new tab. */
  url: string;
  /** Launcher icon tint. */
  color: string;
  glyph: string;
  /** Pinned to the bottom dock. */
  dock?: boolean;
  /** Rendered on the first home screen page. */
  home?: boolean;
}

export const apps: AppDef[] = [
  { id: 'chrome', name: 'Chrome', url: 'https://www.google.com', color: '#3F7DE0', glyph: 'globe', dock: true },
  { id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', color: '#D93025', glyph: 'mail', dock: true },
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://web.whatsapp.com', color: '#1F9E55', glyph: 'chat', dock: true },
  { id: 'maps', name: 'Maps', url: 'https://maps.google.com', color: '#1A73E8', glyph: 'pin', dock: true },
  { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com', color: '#1AA34A', glyph: 'music', dock: true },

  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com', color: '#CC0000', glyph: 'play', home: true },
  { id: 'calendar', name: 'Calendar', url: 'https://calendar.google.com', color: '#1A73E8', glyph: 'calendar', home: true },
  { id: 'drive', name: 'Drive', url: 'https://drive.google.com', color: '#0F8A4F', glyph: 'cloud', home: true },
  { id: 'photos', name: 'Photos', url: 'https://photos.google.com', color: '#C2541F', glyph: 'photos', home: true },
  { id: 'telegram', name: 'Telegram', url: 'https://web.telegram.org', color: '#2296C9', glyph: 'plane', home: true },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', color: '#C13584', glyph: 'camera', home: true },
  { id: 'x', name: 'X', url: 'https://x.com', color: '#16181C', glyph: 'x', home: true },
  { id: 'github', name: 'GitHub', url: 'https://github.com', color: '#2B3137', glyph: 'code', home: true },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com', color: '#0E8C74', glyph: 'spark', home: true },
  { id: 'notion', name: 'Notion', url: 'https://www.notion.so', color: '#26262A', glyph: 'doc', home: true },
  { id: 'netflix', name: 'Netflix', url: 'https://www.netflix.com', color: '#C11119', glyph: 'netflix', home: true },
  { id: 'reddit', name: 'Reddit', url: 'https://www.reddit.com', color: '#D93A00', glyph: 'bubble', home: true },

  { id: 'playstore', name: 'Play Store', url: 'https://play.google.com', color: '#0B7A4B', glyph: 'bag' },
  { id: 'discord', name: 'Discord', url: 'https://discord.com/app', color: '#4A57BD', glyph: 'controller' },
  { id: 'figma', name: 'Figma', url: 'https://www.figma.com', color: '#9B3FBF', glyph: 'palette' },
  { id: 'meet', name: 'Meet', url: 'https://meet.google.com', color: '#12886B', glyph: 'camera' },
];

export const dockApps: AppDef[] = apps.filter((app) => app.dock === true);
export const homeApps: AppDef[] = apps.filter((app) => app.home === true);
