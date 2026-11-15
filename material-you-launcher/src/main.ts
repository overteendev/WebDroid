import { applyTheme, type ThemeMode } from './theme';
import { wallpapers } from './wallpaper';
import { apps, type AppDef } from './apps';
import { buildDrawer, type DrawerApi } from './drawer';
import { buildHome, buildStatusBar } from './home';
import { glyph } from './icons';
import { buildShade, type ShadeApi } from './shade';
import { startClock } from './clock';
import { dragY, el, must } from './ui';

const screen = must<HTMLElement>(document, '#screen');
const wallpaperLayer = must<HTMLElement>(document, '#wallpaper');

let mode: ThemeMode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
let wallpaperIndex = 0;

/* ------------------------------- toast ------------------------------- */

const toastEl = el('div', 'toast');
toastEl.setAttribute('role', 'status');
toastEl.setAttribute('aria-live', 'polite');
let toastTimer = 0;

function toast(message: string): void {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), 2600);
}

/* ---------------------------- app launch ----------------------------- */

const launchEl = el('div', 'launch');
launchEl.innerHTML = [
  '<div class="launch-inner">',
  '<span class="launch-icon"></span>',
  '<span class="launch-name"></span>',
  '<span class="launch-hint">Opening in a new tab</span>',
  '<a class="launch-link" target="_blank" rel="noopener noreferrer" hidden>Open manually</a>',
  '</div>',
].join('');

const launchIcon = must<HTMLElement>(launchEl, '.launch-icon');
const launchName = must<HTMLElement>(launchEl, '.launch-name');
const launchHint = must<HTMLElement>(launchEl, '.launch-hint');
const launchLink = must<HTMLAnchorElement>(launchEl, '.launch-link');

function launch(app: AppDef): void {
  shade.close();
  drawer.close();

  launchIcon.style.setProperty('--app-color', app.color);
  launchIcon.innerHTML = glyph(app.glyph, 34, 1.9);
  launchName.textContent = app.name;
  launchLink.href = app.url;
  launchLink.hidden = true;
  launchHint.textContent = 'Opening in a new tab';
  launchEl.classList.add('visible');

  const win = window.open(app.url, '_blank');

  if (win) {
    try {
      win.opener = null;
    } catch {
      /* cross-origin handle — the tab is already open */
    }
  } else {
    launchHint.textContent = 'Your browser blocked the new tab';
    launchLink.hidden = false;
  }

  window.setTimeout(() => launchEl.classList.remove('visible'), win ? 900 : 4000);
}

launchEl.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (target.closest('.launch-link')) return;
  launchEl.classList.remove('visible');
});

/* --------------------------- shade + drawer -------------------------- */

const shade: ShadeApi = buildShade({
  wallpapers,
  wallpaperIndex,
  mode,
  onWallpaper: (index) => setWallpaper(index),
  onMode: (next) => setMode(next),
  onAirplane: (on) => statusBar.setAirplane(on),
  onOpenChange: () => syncOverlay(),
});

const drawer: DrawerApi = buildDrawer({
  apps,
  onLaunch: (app) => launch(app),
  onOpenChange: () => syncOverlay(),
});

/* ------------------------------- home ------------------------------- */

const home = buildHome({
  onLaunch: (app) => launch(app),
  onOpenDrawer: () => openDrawer(),
});

const statusBar = buildStatusBar();

/* ------------------------------ navbar ------------------------------ */

const nav = el('div', 'navbar');
const backButton = el('button', 'nav-back');
backButton.type = 'button';
backButton.setAttribute('aria-label', 'Back');
backButton.innerHTML = glyph('back', 20, 2.3);

const homePill = el('button', 'nav-pill');
homePill.type = 'button';
homePill.setAttribute('aria-label', 'Go to home screen');

nav.append(backButton, homePill);

const punchHole = el('div', 'punch-hole');
punchHole.setAttribute('aria-hidden', 'true');

const dim = el('div', 'dim');
dim.setAttribute('aria-hidden', 'true');

screen.append(home, statusBar.el, drawer.el, shade.el, dim, punchHole, nav, launchEl, toastEl);

/* --------------------------- theme + wallpaper ---------------------- */

function setMode(next: ThemeMode): void {
  mode = next;
  applyTheme(wallpapers[wallpaperIndex].hue, mode);
}

function setWallpaper(index: number, notify = true): void {
  wallpaperIndex = ((index % wallpapers.length) + wallpapers.length) % wallpapers.length;
  const pack = wallpapers[wallpaperIndex];
  wallpaperLayer.style.backgroundImage = pack.css;
  applyTheme(pack.hue, mode);
  shade.setWallpaper(wallpaperIndex);
  if (notify) toast(`${pack.name} wallpaper · Material You palette regenerated`);
}

/* --------------------------- overlays ------------------------------ */

function syncOverlay(): void {
  screen.classList.toggle('has-overlay', shade.isOpen() || drawer.isOpen());
}

function openShade(): void {
  drawer.close();
  shade.open();
  syncOverlay();
}

function openDrawer(): void {
  shade.close();
  drawer.open();
  syncOverlay();
}

function goHome(): void {
  shade.close();
  drawer.close();
  launchEl.classList.remove('visible');
  syncOverlay();
}

function goBack(): void {
  if (shade.isOpen()) shade.close();
  else if (drawer.isOpen()) drawer.close();
  syncOverlay();
}

homePill.addEventListener('click', goHome);
backButton.addEventListener('click', goBack);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') goHome();
});

/* ---------------------------- gestures ----------------------------- */

/* Pull the shade down from the status bar. */
dragY(statusBar.el, {
  zone: () => !drawer.isOpen(),
  move: (delta) => {
    if (delta > 0) shade.drag(delta);
  },
  end: (delta) => {
    shade.drag(null);
    if (delta > 80) openShade();
  },
});

statusBar.el.addEventListener('click', () => openShade());

/* Swipe up anywhere on the wallpaper to open the app drawer. */
dragY(screen, {
  zone: (event) => {
    const target = event.target as HTMLElement;
    return (
      !shade.isOpen() &&
      !drawer.isOpen() &&
      target.closest('button, a, input, .statusbar') === null
    );
  },
  move: (delta) => {
    if (delta < 0) drawer.drag(delta);
  },
  end: (delta, velocity) => {
    drawer.drag(null);
    if (delta < -60 || velocity < -0.45) openDrawer();
  },
});

/* ------------------------------- boot ------------------------------ */

setWallpaper(0, false);
startClock();
