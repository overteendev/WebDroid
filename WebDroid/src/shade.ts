import { glyph } from './icons';
import type { ThemeMode } from './theme';
import { dragY, el, must } from './ui';
import type { WallpaperPack } from './wallpaper';

interface TileDef {
  id: string;
  label: string;
  icon: string;
  on: boolean;
}

interface NotificationItem {
  id: string;
  app: string;
  color: string;
  icon: string;
  title: string;
  body: string;
  time: string;
}

export interface ShadeOptions {
  wallpapers: WallpaperPack[];
  wallpaperIndex: number;
  mode: ThemeMode;
  onWallpaper: (index: number) => void;
  onMode: (mode: ThemeMode) => void;
  onAirplane: (on: boolean) => void;
  onOpenChange?: () => void;
}

export interface ShadeApi {
  el: HTMLElement;
  open(): void;
  close(): void;
  isOpen(): boolean;
  /** Follows the finger while pulling down from the status bar. */
  drag(offset: number | null): void;
  setWallpaper(index: number): void;
  setMode(mode: ThemeMode): void;
}

export function buildShade(options: ShadeOptions): ShadeApi {
  const wrapper = el('div', 'shade');
  const panel = el('section', 'shade-panel');
  panel.setAttribute('aria-label', 'Quick settings');

  const handle = el('div', 'shade-handle');
  handle.setAttribute('role', 'button');
  handle.tabIndex = 0;
  handle.setAttribute('aria-label', 'Close quick settings');

  const head = el('header', 'shade-head');
  head.innerHTML = [
    '<div class="shade-clock" data-clock></div>',
    '<div class="shade-date" data-date="long"></div>',
  ].join('');

  const closeButton = el('button', 'shade-close');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close quick settings');
  closeButton.innerHTML = glyph('chevron', 18, 2.2);
  head.append(closeButton);

  const tiles = el('div', 'tiles');
  const tileDefs: TileDef[] = [
    { id: 'wifi', label: 'Wi-Fi', icon: 'wifi', on: true },
    { id: 'bluetooth', label: 'Bluetooth', icon: 'bluetooth', on: false },
    { id: 'dnd', label: 'Do Not Disturb', icon: 'dnd', on: false },
    { id: 'flashlight', label: 'Flashlight', icon: 'flashlight', on: false },
    { id: 'airplane', label: 'Airplane mode', icon: 'airplane', on: false },
    { id: 'battery-saver', label: 'Battery saver', icon: 'battery', on: false },
    { id: 'dark', label: 'Dark theme', icon: 'moon', on: options.mode === 'dark' },
    { id: 'rotate', label: 'Rotation lock', icon: 'rotate', on: false },
  ];

  const brightness = el('div', 'brightness');
  brightness.innerHTML = [
    glyph('sun', 15, 2),
    '<input type="range" min="20" max="100" step="1" value="88" aria-label="Screen brightness" />',
    glyph('sun', 21, 2),
  ].join('');
  const range = must<HTMLInputElement>(brightness, 'input');

  const notifications: NotificationItem[] = [
    {
      id: 'n1',
      app: 'Gmail',
      color: '#D93025',
      icon: 'mail',
      title: 'Your weekly digest',
      body: '4 new pull requests and 2 review requests are waiting.',
      time: '2m',
    },
    {
      id: 'n2',
      app: 'Calendar',
      color: '#1A73E8',
      icon: 'calendar',
      title: 'Standup in 15 minutes',
      body: 'Meet · 10:30 – 10:45',
      time: '5m',
    },
    {
      id: 'n3',
      app: 'Spotify',
      color: '#1AA34A',
      icon: 'music',
      title: 'Continue listening',
      body: 'Lo-fi focus · 1h 12m left in this playlist.',
      time: '18m',
    },
  ];

  const notifHead = el('div', 'notif-head');
  notifHead.innerHTML =
    '<span>Notifications</span><button type="button" class="text-btn" data-clear>Clear all</button>';
  const clearButton = must<HTMLButtonElement>(notifHead, '[data-clear]');
  const notifList = el('div', 'notif-list');
  const dndNote = el('p', 'shade-note');
  dndNote.textContent = 'Do Not Disturb is on — notifications are silenced.';
  dndNote.hidden = true;

  const foot = el('footer', 'shade-foot');
  const footLabel = el('div', 'shade-foot-label');
  footLabel.innerHTML = `${glyph('palette', 14, 2)}<span>Wallpaper &amp; theme</span>`;
  const swatches = el('div', 'swatches');
  foot.append(footLabel, swatches);

  panel.append(head, tiles, brightness, notifHead, notifList, dndNote, foot, handle);
  wrapper.append(panel);

  let opened = false;
  let currentMode: ThemeMode = options.mode;
  let currentWallpaper = options.wallpaperIndex;

  /* ---------------- quick settings tiles ---------------- */

  function renderTiles(): void {
    tiles.replaceChildren();

    for (const tile of tileDefs) {
      const button = el('button', 'tile');
      button.type = 'button';
      button.dataset.tile = tile.id;
      button.classList.toggle('on', tile.on);
      button.setAttribute('aria-pressed', String(tile.on));
      button.setAttribute('aria-label', tile.label);

      const icon = el('span', 'tile-icon');
      icon.innerHTML = glyph(tile.icon, 18, 2);

      const label = el('span', 'tile-label');
      label.textContent = tile.label;

      button.append(icon, label);
      button.addEventListener('click', () => toggleTile(tile));
      tiles.append(button);
    }
  }

  function toggleTile(tile: TileDef): void {
    if (tile.id === 'dark') {
      const next: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
      setMode(next);
      options.onMode(next);
      return;
    }

    tile.on = !tile.on;

    const wifi = tileDefs.find((item) => item.id === 'wifi');
    const airplane = tileDefs.find((item) => item.id === 'airplane');

    if (tile.id === 'wifi' && tile.on && airplane) {
      airplane.on = false;
      options.onAirplane(false);
    }

    if (tile.id === 'airplane' && tile.on && wifi) {
      wifi.on = false;
    }

    renderTiles();

    if (tile.id === 'dnd') renderNotifications();
    if (tile.id === 'airplane') options.onAirplane(tile.on);
  }

  function setMode(mode: ThemeMode): void {
    currentMode = mode;
    const dark = tileDefs.find((item) => item.id === 'dark');
    if (dark) dark.on = mode === 'dark';
    renderTiles();
  }

  /* ---------------- brightness ---------------- */

  function applyBrightness(): void {
    const value = Number(range.value);
    const min = Number(range.min);
    const max = Number(range.max);
    const ratio = (value - min) / (max - min);
    range.style.setProperty('--fill', `${Math.round(ratio * 100)}%`);
    document.documentElement.style.setProperty('--dim', ((1 - ratio) * 0.5).toFixed(3));
  }

  range.addEventListener('input', applyBrightness);

  /* ---------------- notifications ---------------- */

  function dismiss(id: string): void {
    const index = notifications.findIndex((item) => item.id === id);
    if (index === -1) return;
    notifications.splice(index, 1);
    renderNotifications();
  }

  function renderNotifications(): void {
    const dndOn = tileDefs.find((item) => item.id === 'dnd')?.on ?? false;

    dndNote.hidden = !dndOn;
    notifList.hidden = dndOn;
    clearButton.hidden = dndOn || notifications.length === 0;
    notifList.replaceChildren();

    if (dndOn) return;

    if (notifications.length === 0) {
      const empty = el('p', 'shade-note');
      empty.textContent = 'No notifications';
      notifList.append(empty);
      return;
    }

    for (const item of notifications) {
      const card = el('article', 'notif');
      card.innerHTML = [
        `<span class="notif-icon" style="background:${item.color}">${glyph(item.icon, 16, 2)}</span>`,
        '<div class="notif-main">',
        `<div class="notif-meta"><span>${item.app}</span><span class="notif-dot">•</span><span>${item.time}</span></div>`,
        `<div class="notif-title">${item.title}</div>`,
        `<div class="notif-body">${item.body}</div>`,
        '</div>',
        `<button type="button" class="notif-close" aria-label="Dismiss ${item.app} notification">${glyph('close', 13, 2.2)}</button>`,
      ].join('');

      const close = must<HTMLButtonElement>(card, '.notif-close');
      close.addEventListener('click', () => dismiss(item.id));
      notifList.append(card);
    }
  }

  clearButton.addEventListener('click', () => {
    notifications.length = 0;
    renderNotifications();
  });

  /* ---------------- wallpaper swatches ---------------- */

  function renderSwatches(): void {
    swatches.replaceChildren();

    options.wallpapers.forEach((pack, index) => {
      const button = el('button', 'swatch');
      button.type = 'button';
      button.title = pack.name;
      button.setAttribute('aria-label', `${pack.name} wallpaper`);
      button.classList.toggle('active', index === currentWallpaper);
      button.style.setProperty('--swatch', pack.swatch);
      button.addEventListener('click', () => options.onWallpaper(index));
      swatches.append(button);
    });
  }

  function setWallpaper(index: number): void {
    currentWallpaper = index;
    renderSwatches();
  }

  /* ---------------- open / close ---------------- */

  function setOpen(next: boolean): void {
    opened = next;
    wrapper.classList.remove('dragging');
    wrapper.style.transform = '';
    wrapper.classList.toggle('open', next);
    wrapper.setAttribute('aria-hidden', String(!next));
    options.onOpenChange?.();
  }

  function open(): void {
    setOpen(true);
  }

  function close(): void {
    setOpen(false);
  }

  function drag(offset: number | null): void {
    if (offset === null) {
      wrapper.classList.remove('dragging');
      wrapper.style.transform = '';
      return;
    }

    wrapper.classList.add('dragging');
    if (opened) {
      wrapper.style.transform = `translateY(${Math.min(0, offset)}px)`;
    } else {
      wrapper.style.transform = `translateY(calc(-100% + ${Math.max(0, offset)}px))`;
    }
  }

  handle.addEventListener('click', close);
  handle.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      close();
    }
  });
  closeButton.addEventListener('click', close);

  dragY(panel, {
    zone: (event) => opened && (event.target as HTMLElement).closest('.shade-head, .shade-handle') !== null,
    move: (delta) => {
      if (delta < 0) drag(delta);
    },
    end: (delta, velocity) => {
      drag(null);
      if (delta < -70 || velocity < -0.5) close();
    },
  });

  renderTiles();
  renderNotifications();
  renderSwatches();
  applyBrightness();
  wrapper.setAttribute('aria-hidden', 'true');

  return {
    el: wrapper,
    open,
    close,
    isOpen: () => opened,
    drag,
    setWallpaper,
    setMode,
  };
}
