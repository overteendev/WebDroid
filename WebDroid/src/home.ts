import type { AppDef } from './apps';
import { dockApps, homeApps } from './apps';
import { glyph } from './icons';
import { appButton } from './tile';
import { el, must } from './ui';

export interface StatusBarApi {
  el: HTMLElement;
  setAirplane(on: boolean): void;
}

export function buildStatusBar(): StatusBarApi {
  const bar = el('div', 'statusbar');
  bar.title = 'Swipe down for quick settings';

  const time = el('span', 'sb-time');
  time.dataset.clock = '';

  const icons = el('div', 'sb-icons');
  icons.innerHTML = [
    `<span class="sb-airplane" hidden>${glyph('airplane', 15, 2)}</span>`,
    `<span class="sb-signal">${glyph('signal', 16, 2.8)}</span>`,
    `<span class="sb-wifi">${glyph('wifi', 16, 2.2)}</span>`,
    `<span class="sb-battery">${glyph('battery', 21, 1.7)}</span>`,
  ].join('');

  bar.append(time, icons);

  const airplaneIcon = must<HTMLElement>(icons, '.sb-airplane');
  const signalIcon = must<HTMLElement>(icons, '.sb-signal');
  const wifiIcon = must<HTMLElement>(icons, '.sb-wifi');

  return {
    el: bar,
    setAirplane(on: boolean): void {
      airplaneIcon.hidden = !on;
      signalIcon.hidden = on;
      wifiIcon.hidden = on;
    },
  };
}

export interface HomeOptions {
  onLaunch: (app: AppDef) => void;
  onOpenDrawer: () => void;
}

export function buildHome(options: HomeOptions): HTMLElement {
  const home = el('div', 'home');

  const glance = el('div', 'glance');
  glance.innerHTML = [
    glyph('calendar', 15, 2),
    '<span class="glance-date" data-date="short"></span>',
    '<span class="glance-sep">·</span>',
    '<span class="glance-event">No events today</span>',
  ].join('');

  const widget = el('section', 'clock-widget');
  widget.setAttribute('aria-label', 'Clock widget');
  const widgetTime = el('div', 'clock-time');
  widgetTime.dataset.clock = '';
  const widgetDate = el('div', 'clock-date');
  widgetDate.dataset.date = 'short';
  widget.append(widgetTime, widgetDate);

  const grid = el('div', 'app-grid');
  homeApps.forEach((app) => {
    grid.append(appButton(app));
  });

  const search = el('button', 'search-pill');
  search.type = 'button';
  search.setAttribute('aria-label', 'Open app drawer');
  search.innerHTML = [
    glyph('search', 19, 2.1),
    '<span class="search-label">Search</span>',
    '<span class="search-spacer"></span>',
    glyph('mic', 18, 2.1),
  ].join('');
  search.addEventListener('click', options.onOpenDrawer);

  const dock = el('nav', 'dock');
  dock.setAttribute('aria-label', 'Dock');
  dockApps.forEach((app) => {
    dock.append(appButton(app, { label: false }));
  });

  home.append(glance, widget, grid, search, dock);

  home.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>('[data-app-id]');
    const id = button?.dataset.appId;
    if (!id) return;
    const app = [...homeApps, ...dockApps].find((candidate) => candidate.id === id);
    if (app) options.onLaunch(app);
  });

  return home;
}
