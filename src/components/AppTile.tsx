import { useEffect, useRef } from 'react';
import type { AppDef } from '../data/apps';
import { triggerHaptic } from '../utils/haptics';
import { AppIcon } from './AppIcon';
import { Glyph } from './Glyph';

export interface AppTileProps {
  app: AppDef;
  label?: boolean;
  onLaunch: (app: AppDef, originRect?: DOMRect) => void;
  onLongPress?: (app: AppDef, anchorRect: DOMRect) => void;
}

export function AppTile({ app, label = true, onLaunch, onLongPress }: AppTileProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressedRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    iconRef.current?.style.setProperty('--app-color', app.color);
  }, [app.color]);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  function clearLongPress(): void {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    startPosRef.current = null;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>): void {
    if (!onLongPress) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    longPressedRef.current = false;
    startPosRef.current = { x: event.clientX, y: event.clientY };

    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      longPressedRef.current = true;
      triggerHaptic('longPress');
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        onLongPress(app, rect);
      }
    }, 450);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>): void {
    if (!startPosRef.current || longPressTimerRef.current === null) return;
    const dx = event.clientX - startPosRef.current.x;
    const dy = event.clientY - startPosRef.current.y;
    if (Math.hypot(dx, dy) > 8) {
      clearLongPress();
    }
  }

  function handleClick(): void {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    triggerHaptic('tap');
    onLaunch(app, iconRef.current?.getBoundingClientRect());
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className="app"
      data-app-id={app.id}
      title={app.name}
      aria-label={`Open ${app.name}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
      onContextMenu={(event) => {
        if (!onLongPress) return;
        event.preventDefault();
        clearLongPress();
        triggerHaptic('longPress');
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) onLongPress(app, rect);
      }}
      onClick={handleClick}
    >
      <span ref={iconRef} className="app-icon">
        <AppIcon icon={app.faIcon} size={23} />
        {app.isShortcut && (
          <span className="app-shortcut-badge" aria-hidden="true">
            <Glyph name="shortcut" size={11} weight={600} />
          </span>
        )}
      </span>
      {label && <span className="app-label">{app.name}</span>}
    </button>
  );
}
