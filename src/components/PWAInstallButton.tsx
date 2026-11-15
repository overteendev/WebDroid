import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { triggerHaptic } from '../utils/haptics';
import { Glyph } from './Glyph';

export interface PWAInstallButtonProps {
  compact?: boolean;
}

export function PWAInstallButton({ compact = false }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return compact ? null : (
      <div className="pwa-status-row">
        <span className="settings-row-icon">
          <Glyph name="check_circle" size={18} filled />
        </span>
        <div className="settings-row-text">
          <span className="settings-row-title">Installed app</span>
          <span className="settings-row-sub">Standalone · Offline ready</span>
        </div>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        className={compact ? 'pwa-install-chip' : 'pwa-install-banner'}
        onClick={() => {
          triggerHaptic('tap');
          void install();
        }}
      >
        <Glyph name="install_mobile" size={compact ? 16 : 20} filled />
        <div className="pwa-install-copy">
          <span className="pwa-install-title">Install app</span>
          {!compact && <span className="pwa-install-sub">Add to home screen</span>}
        </div>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          className={compact ? 'pwa-install-chip' : 'pwa-install-banner'}
          onClick={() => {
            triggerHaptic('tap');
            setShowIOSGuide(true);
          }}
        >
          <Glyph name="ios_share" size={compact ? 16 : 20} />
          <div className="pwa-install-copy">
            <span className="pwa-install-title">Add to Home Screen</span>
          </div>
        </button>

        {showIOSGuide && (
          <div
            className="folder-backdrop open"
            role="dialog"
            aria-label="Install on iOS"
            onClick={(event) => {
              if (event.target === event.currentTarget) setShowIOSGuide(false);
            }}
          >
            <div className="folder-card">
              <header className="folder-card-head">
                <h3 className="folder-card-title">Add to Home Screen</h3>
                <button
                  type="button"
                  className="folder-card-close"
                  aria-label="Close"
                  onClick={() => setShowIOSGuide(false)}
                >
                  <Glyph name="close" size={18} />
                </button>
              </header>
              <p className="ios-guide-copy">
                Share &rarr; <strong>Add to Home Screen</strong>
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
