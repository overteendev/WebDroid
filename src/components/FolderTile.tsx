import { useEffect, useRef } from 'react';
import type { AppCategory, AppDef } from '../data/apps';
import { triggerHaptic } from '../utils/haptics';
import { AppIcon } from './AppIcon';

export interface FolderTileProps {
  category: AppCategory;
  apps: AppDef[];
  onOpen: (category: AppCategory) => void;
}

export function FolderTile({ category, apps, onOpen }: FolderTileProps) {
  const miniRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const previewApps = apps.slice(0, 4);

  useEffect(() => {
    for (const app of previewApps) {
      miniRefs.current[app.id]?.style.setProperty('--app-color', app.color);
    }
  }, [previewApps]);

  return (
    <button
      type="button"
      className="app folder-tile"
      aria-label={`Open ${category} folder (${apps.length} apps)`}
      onClick={() => {
        triggerHaptic('transition');
        onOpen(category);
      }}
    >
      <span className="folder-icon-box" aria-hidden="true">
        {previewApps.map((app) => (
          <span
            key={app.id}
            ref={(node) => {
              miniRefs.current[app.id] = node;
            }}
            className="folder-mini-icon"
          >
            <AppIcon icon={app.faIcon} size={11} />
          </span>
        ))}
      </span>
      <span className="app-label">{category}</span>
    </button>
  );
}
