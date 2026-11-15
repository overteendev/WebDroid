import { useEffect, useRef } from 'react';
import type { AppDef } from '../data/apps';
import { triggerHaptic } from '../utils/haptics';
import { Glyph } from './Glyph';

export interface ContextMenuTarget {
  app: AppDef;
  rect: DOMRect;
}

export interface AppContextMenuProps {
  target: ContextMenuTarget | null;
  screenRect: DOMRect | null;
  onClose: () => void;
  onAppInfo: (app: AppDef) => void;
  onCreateShortcut: (app: AppDef) => void;
  onUninstall: (app: AppDef) => void;
}

export function AppContextMenu({
  target,
  screenRect,
  onClose,
  onAppInfo,
  onCreateShortcut,
  onUninstall,
}: AppContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu || !target || !screenRect) return;

    const menuWidth = 204;
    const menuHeight = 178;
    const pad = 12;

    const relLeft = target.rect.left - screenRect.left + target.rect.width / 2 - menuWidth / 2;
    const clampedLeft = Math.max(pad, Math.min(screenRect.width - menuWidth - pad, relLeft));

    const spaceAbove = target.rect.top - screenRect.top;
    const openAbove = spaceAbove > menuHeight + 48;
    const relTop = openAbove
      ? target.rect.top - screenRect.top - menuHeight - 8
      : target.rect.bottom - screenRect.top + 8;
    const clampedTop = Math.max(50, Math.min(screenRect.height - menuHeight - 44, relTop));

    menu.style.setProperty('--menu-x', `${Math.round(clampedLeft)}px`);
    menu.style.setProperty('--menu-y', `${Math.round(clampedTop)}px`);
  }, [target, screenRect]);

  if (!target) return null;

  const { app } = target;

  return (
    <div
      className="ctx-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          triggerHaptic('tick');
          onClose();
        }
      }}
    >
      <div
        ref={menuRef}
        className="ctx-menu"
        role="menu"
        aria-label={`${app.name} options`}
      >
        <div className="ctx-header">
          <span className="ctx-title">{app.name}</span>
          <span className="ctx-sub">{app.isShortcut ? 'Shortcut' : app.category}</span>
        </div>

        <button
          type="button"
          className="ctx-item"
          role="menuitem"
          onClick={() => {
            triggerHaptic('tap');
            onClose();
            onAppInfo(app);
          }}
        >
          <Glyph name="info" size={18} />
          <span>App info</span>
        </button>

        <button
          type="button"
          className="ctx-item"
          role="menuitem"
          onClick={() => {
            triggerHaptic('success');
            onClose();
            onCreateShortcut(app);
          }}
        >
          <Glyph name="add_to_home_screen" size={18} />
          <span>Create shortcut</span>
        </button>

        <button
          type="button"
          className="ctx-item danger"
          role="menuitem"
          onClick={() => {
            triggerHaptic('tap');
            onClose();
            onUninstall(app);
          }}
        >
          <Glyph name="delete_outline" size={18} />
          <span>{app.isShortcut ? 'Remove shortcut' : 'Uninstall'}</span>
        </button>
      </div>
    </div>
  );
}
