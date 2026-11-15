import { useEffect, useRef } from 'react';
import type { AppDef } from '../data/apps';
import { triggerHaptic } from '../utils/haptics';
import { AppIcon } from './AppIcon';
import { Glyph } from './Glyph';

export interface AppInfoModalProps {
  app: AppDef | null;
  onClose: () => void;
  onOpenApp: (app: AppDef, originRect?: DOMRect) => void;
  onCreateShortcut: (app: AppDef) => void;
  onUninstall: (app: AppDef) => void;
}

export function AppInfoModal({
  app,
  onClose,
  onOpenApp,
  onCreateShortcut,
  onUninstall,
}: AppInfoModalProps) {
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (app) {
      iconRef.current?.style.setProperty('--app-color', app.color);
    }
  }, [app]);

  return (
    <div
      className={`sheet-overlay${app ? ' open' : ''}`}
      aria-hidden={!app}
      role="dialog"
      aria-label="App info"
    >
      {app && (
        <div className="sheet-panel">
          <header className="sheet-header">
            <button
              type="button"
              className="sheet-back"
              aria-label="Back"
              onClick={() => {
                triggerHaptic('tick');
                onClose();
              }}
            >
              <Glyph name="arrow_back" size={20} />
            </button>
            <h2 className="sheet-title">App info</h2>
          </header>

          <div className="sheet-content">
            <div className="app-info-hero">
              <span ref={iconRef} className="app-info-icon">
                <AppIcon icon={app.faIcon} size={30} />
              </span>
              <div className="app-info-name">{app.name}</div>
              <div className="app-info-pkg">{app.packageName}</div>
            </div>

            <div className="app-info-actions">
              <button
                type="button"
                className="md3-tonal-btn"
                onClick={() => {
                  triggerHaptic('tap');
                  const rect = iconRef.current?.getBoundingClientRect();
                  onClose();
                  onOpenApp(app, rect);
                }}
              >
                <Glyph name="open_in_new" size={18} />
                <span>Open</span>
              </button>
              <button
                type="button"
                className="md3-tonal-btn"
                onClick={() => {
                  triggerHaptic('success');
                  onCreateShortcut(app);
                }}
              >
                <Glyph name="add_to_home_screen" size={18} />
                <span>Shortcut</span>
              </button>
              <button
                type="button"
                className="md3-tonal-btn danger"
                disabled={app.systemApp && !app.isShortcut}
                onClick={() => {
                  triggerHaptic('tap');
                  onClose();
                  onUninstall(app);
                }}
              >
                <Glyph name="delete_outline" size={18} />
                <span>{app.systemApp && !app.isShortcut ? 'System' : 'Uninstall'}</span>
              </button>
            </div>

            <div className="settings-group">
              <div className="settings-row">
                <span className="settings-row-label">Category</span>
                <span className="settings-row-value">{app.category}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Version</span>
                <span className="settings-row-value tabular">{app.version}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Storage used</span>
                <span className="settings-row-value tabular">{app.storageMb} MB</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Target</span>
                <span className="settings-row-value truncate-url">{app.url}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
