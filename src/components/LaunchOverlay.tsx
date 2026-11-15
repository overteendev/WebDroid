import { useLayoutEffect, useRef, useState } from 'react';
import type { AppDef } from '../data/apps';
import { triggerHaptic } from '../utils/haptics';
import { AppIcon } from './AppIcon';

export interface LaunchOrigin {
  x: number;
  y: number;
  radius: number;
}

export interface LaunchOverlayProps {
  app: AppDef | null;
  visible: boolean;
  blocked: boolean;
  origin: LaunchOrigin | null;
  launchKey: number;
  onDismiss: () => void;
}

export function LaunchOverlay({
  app,
  visible,
  blocked,
  origin,
  launchKey,
  onDismiss,
}: LaunchOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    if (app) {
      el.style.setProperty('--app-color', app.color);
      iconRef.current?.style.setProperty('--app-color', app.color);
    }

    if (!visible) {
      setExpanded(false);
      return;
    }

    const w = el.clientWidth || 374;
    const h = el.clientHeight || 818;
    const ox = origin ? Math.max(0, Math.min(w, origin.x)) : w / 2;
    const oy = origin ? Math.max(0, Math.min(h, origin.y)) : h / 2;
    const startRadius = origin ? Math.max(18, origin.radius) : 27;
    const endRadius = Math.ceil(Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy))) + 18;
    const dx = ox - w / 2;
    const dy = oy - h / 2;

    el.classList.add('preparing');
    el.style.setProperty('--reveal-x', `${ox.toFixed(1)}px`);
    el.style.setProperty('--reveal-y', `${oy.toFixed(1)}px`);
    el.style.setProperty('--reveal-start', `${startRadius}px`);
    el.style.setProperty('--reveal-end', `${endRadius}px`);
    el.style.setProperty('--icon-dx', `${dx.toFixed(1)}px`);
    el.style.setProperty('--icon-dy', `${dy.toFixed(1)}px`);
    setExpanded(false);

    void el.offsetWidth;
    el.classList.remove('preparing');

    const rafId = window.requestAnimationFrame(() => {
      setExpanded(true);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [app, visible, origin, launchKey]);

  return (
    <div
      ref={overlayRef}
      className={`launch${visible ? ' visible' : ''}${expanded ? ' expanded' : ''}`}
      aria-hidden={!visible}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest('.launch-link')) return;
        triggerHaptic('tick');
        onDismiss();
      }}
    >
      <div className="launch-inner">
        <span ref={iconRef} className="launch-icon">
          {app && <AppIcon icon={app.faIcon} size={32} />}
        </span>
        <span className="launch-name">{app?.name ?? ''}</span>
        <span className="launch-hint">
          {blocked ? 'Popup blocked' : 'Opening…'}
        </span>
        <a
          className="launch-link"
          href={app?.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          hidden={!blocked}
          onClick={() => triggerHaptic('tap')}
        >
          Open manually
        </a>
      </div>
    </div>
  );
}
