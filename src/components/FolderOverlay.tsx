import type { AppCategory, AppDef } from '../data/apps';
import { triggerHaptic } from '../utils/haptics';
import { AppTile } from './AppTile';
import { Glyph } from './Glyph';

export interface FolderOverlayProps {
  category: AppCategory | null;
  apps: AppDef[];
  onClose: () => void;
  onLaunch: (app: AppDef, originRect?: DOMRect) => void;
  onLongPress: (app: AppDef, anchorRect: DOMRect) => void;
}

export function FolderOverlay({
  category,
  apps,
  onClose,
  onLaunch,
  onLongPress,
}: FolderOverlayProps) {
  const open = category !== null;

  return (
    <div
      className={`folder-backdrop${open ? ' open' : ''}`}
      aria-hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          triggerHaptic('tick');
          onClose();
        }
      }}
    >
      <section
        className="folder-card"
        role="dialog"
        aria-label={category ? `${category} folder` : 'App folder'}
      >
        <header className="folder-card-head">
          <div className="folder-card-titles">
            <h2 className="folder-card-title">{category ?? ''}</h2>
            <span className="folder-card-count">{apps.length} apps</span>
          </div>
          <button
            type="button"
            className="folder-card-close"
            aria-label="Close folder"
            onClick={() => {
              triggerHaptic('tick');
              onClose();
            }}
          >
            <Glyph name="close" size={18} />
          </button>
        </header>

        <div className="folder-card-grid">
          {apps.map((app) => (
            <AppTile
              key={app.id}
              app={app}
              onLaunch={(target, originRect) => {
                onClose();
                onLaunch(target, originRect);
              }}
              onLongPress={onLongPress}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
