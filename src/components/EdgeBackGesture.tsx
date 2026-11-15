import { useEffect, useRef, useState, type RefObject } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { Glyph } from './Glyph';

export type BackSensitivity = 'low' | 'medium' | 'high';

export interface EdgeBackGestureProps {
  screenRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  canGoBack: boolean;
  sensitivity?: BackSensitivity;
  onProgress?: (progress: number | null) => void;
  onBack: () => void;
}

interface EdgeDragState {
  side: 'left' | 'right';
  ready: boolean;
}

const SENSITIVITY_THRESHOLDS: Record<BackSensitivity, number> = {
  low: 68,
  medium: 52,
  high: 34,
};

export function EdgeBackGesture({
  screenRef,
  enabled,
  canGoBack,
  sensitivity = 'medium',
  onProgress,
  onBack,
}: EdgeBackGestureProps) {
  const [drag, setDrag] = useState<EdgeDragState | null>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const latestRef = useRef<{ x: number; y: number } | null>(null);
  const activeRef = useRef<{
    pointerId: number;
    side: 'left' | 'right';
    startX: number;
    ready: boolean;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !canGoBack) {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      activeRef.current = null;
      setDrag(null);
      onProgress?.(null);
    }
  }, [enabled, canGoBack, onProgress]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!enabled || !canGoBack) return null;

  const thresholdPx = SENSITIVITY_THRESHOLDS[sensitivity];

  function updatePillStyle(side: 'left' | 'right', progress: number, y: number): void {
    const el = pillRef.current;
    if (!el) return;
    el.style.setProperty('--edge-y', `${Math.round(y)}px`);
    el.style.setProperty('--edge-shift', `${(progress * 26).toFixed(1)}px`);
    el.style.setProperty('--edge-scale', (0.76 + progress * 0.28).toFixed(3));
    el.dataset.side = side;
  }

  function flushFrame(): void {
    rafRef.current = null;
    const state = activeRef.current;
    const latest = latestRef.current;
    if (!state || !latest) return;

    const inward =
      state.side === 'left'
        ? latest.x - state.startX
        : state.startX - latest.x;
    const clamped = Math.max(0, inward);
    const progress = Math.min(1, clamped / thresholdPx);
    const ready = clamped >= thresholdPx;

    if (ready !== state.ready) {
      state.ready = ready;
      if (ready) triggerHaptic('tick');
      setDrag({ side: state.side, ready });
    }

    const screenRect = screenRef.current?.getBoundingClientRect();
    const relY = screenRect ? latest.y - screenRect.top : 360;
    const clampedY = Math.max(96, Math.min((screenRect?.height ?? 800) - 96, relY));

    updatePillStyle(state.side, progress, clampedY);
    onProgress?.(progress);
  }

  function handlePointerDown(
    side: 'left' | 'right',
    event: React.PointerEvent<HTMLDivElement>,
  ): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const screenRect = screenRef.current?.getBoundingClientRect();
    const relY = screenRect ? event.clientY - screenRect.top : 360;
    const clampedY = Math.max(96, Math.min((screenRect?.height ?? 800) - 96, relY));

    activeRef.current = {
      pointerId: event.pointerId,
      side,
      startX: event.clientX,
      ready: false,
    };
    latestRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ side, ready: false });
    onProgress?.(0.04);
    window.requestAnimationFrame(() => updatePillStyle(side, 0.05, clampedY));
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    const state = activeRef.current;
    if (!state || event.pointerId !== state.pointerId) return;
    latestRef.current = { x: event.clientX, y: event.clientY };
    if (rafRef.current === null) {
      rafRef.current = window.requestAnimationFrame(flushFrame);
    }
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>): void {
    const state = activeRef.current;
    if (!state || event.pointerId !== state.pointerId) return;
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (event.currentTarget.hasPointerCapture(state.pointerId)) {
      event.currentTarget.releasePointerCapture(state.pointerId);
    }
    const shouldTrigger = state.ready;
    activeRef.current = null;
    latestRef.current = null;
    setDrag(null);
    onProgress?.(null);
    if (shouldTrigger) {
      triggerHaptic('tap');
      onBack();
    }
  }

  return (
    <>
      <div
        className="edge-zone edge-zone-left"
        aria-hidden="true"
        onPointerDown={(event) => handlePointerDown('left', event)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      />
      <div
        className="edge-zone edge-zone-right"
        aria-hidden="true"
        onPointerDown={(event) => handlePointerDown('right', event)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      />
      {drag && (
        <div
          ref={pillRef}
          className={`edge-back-pill${drag.ready ? ' ready' : ''} side-${drag.side}`}
          aria-hidden="true"
        >
          <Glyph name={drag.side === 'left' ? 'arrow_forward' : 'arrow_back'} size={18} />
        </div>
      )}
    </>
  );
}
