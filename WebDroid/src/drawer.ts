import type { AppDef } from './apps';
import { glyph } from './icons';
import { appButton } from './tile';
import { dragY, el, must } from './ui';

export interface DrawerOptions {
  apps: AppDef[];
  onLaunch: (app: AppDef) => void;
  onOpenChange?: (open: boolean) => void;
}

export interface DrawerApi {
  el: HTMLElement;
  open(): void;
  close(): void;
  isOpen(): boolean;
  /** Follows the finger while swiping up from the home screen. */
  drag(offset: number | null): void;
}

export function buildDrawer(options: DrawerOptions): DrawerApi {
  const wrapper = el('div', 'drawer');
  const panel = el('div', 'drawer-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'All apps');

  const handle = el('div', 'drawer-handle');
  handle.setAttribute('aria-hidden', 'true');

  const head = el('div', 'drawer-head');
  head.innerHTML = [
    '<div class="drawer-time" data-clock></div>',
    '<div class="drawer-date" data-date="long"></div>',
  ].join('');

  const search = el('label', 'drawer-search');
  search.innerHTML = [
    glyph('search', 18, 2.1),
    '<input type="search" placeholder="Search apps" aria-label="Search apps" autocomplete="off" spellcheck="false" />',
  ].join('');

  const grid = el('div', 'app-grid drawer-grid');
  const empty = el('p', 'drawer-empty');
  empty.textContent = 'No apps match that search.';
  empty.hidden = true;

  const hint = el('p', 'drawer-hint');
  hint.textContent = 'Swipe down or press the home pill to close';

  panel.append(handle, head, search, grid, empty, hint);
  wrapper.append(panel);

  const input = must<HTMLInputElement>(search, 'input');
  let opened = false;

  function render(query: string): void {
    const needle = query.trim().toLowerCase();
    const list =
      needle === ''
        ? options.apps
        : options.apps.filter(
            (app) => app.name.toLowerCase().includes(needle) || app.id.includes(needle),
          );

    grid.replaceChildren();
    for (const app of list) {
      const button = appButton(app);
      button.addEventListener('click', () => options.onLaunch(app));
      grid.append(button);
    }

    grid.hidden = list.length === 0;
    empty.hidden = list.length > 0;
  }

  function setOpen(next: boolean): void {
    opened = next;
    wrapper.classList.remove('dragging');
    wrapper.style.transform = '';
    wrapper.classList.toggle('open', next);
    if (!next) {
      input.value = '';
      render('');
      grid.scrollTop = 0;
    }
    options.onOpenChange?.(next);
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
      wrapper.style.transform = `translateY(${Math.max(0, offset)}px)`;
    } else {
      wrapper.style.transform = `translateY(calc(100% + ${Math.min(0, offset)}px))`;
    }
  }

  input.addEventListener('input', () => render(input.value));

  dragY(panel, {
    zone: (event) =>
      opened &&
      (event.target as HTMLElement).closest('.drawer-head, .drawer-handle, .drawer-hint') !== null,
    move: (delta) => {
      if (delta > 0) drag(delta);
    },
    end: (delta, velocity) => {
      drag(null);
      if (delta > 80 || velocity > 0.5) close();
    },
  });

  render('');

  return {
    el: wrapper,
    open,
    close,
    isOpen: () => opened,
    drag,
  };
}
