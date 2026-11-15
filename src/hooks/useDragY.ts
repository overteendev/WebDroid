import { useEffect, useRef, type RefObject } from 'react';

export interface DragHandlers {
  zone?: (event: PointerEvent) => boolean;
  start?: () => void;
  move?: (deltaY: number) => void;
  end?: (deltaY: number, velocity: number) => void;
}

export function rubberBand(offset: number, max = 140, tension = 0.34): number {
  const sign = offset < 0 ? -1 : 1;
  const abs = Math.abs(offset);
  return sign * ((abs * tension * max) / (abs * tension + max));
}

interface Sample {
  y: number;
  t: number;
}

export function useDragY(
  targetRef: RefObject<HTMLElement | null>,
  handlers: DragHandlers,
): void {
  const handlersRef = useRef<DragHandlers>(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    let pointerId: number | null = null;
    let startY = 0;
    let latestY = 0;
    let rafId: number | null = null;
    let samples: Sample[] = [];

    const pruneSamples = (now: number): void => {
      const cutoff = now - 90;
      while (samples.length > 1 && samples[0].t < cutoff) {
        samples.shift();
      }
    };

    const computeVelocity = (now: number): number => {
      pruneSamples(now);
      if (samples.length < 2) return 0;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = Math.max(1, last.t - first.t);
      return (last.y - first.y) / dt;
    };

    const flushMove = (): void => {
      rafId = null;
      if (pointerId === null) return;
      handlersRef.current.move?.(latestY - startY);
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const current = handlersRef.current;
      if (current.zone && !current.zone(event)) return;
      pointerId = event.pointerId;
      startY = event.clientY;
      latestY = startY;
      samples = [{ y: startY, t: event.timeStamp }];
      try {
        target.setPointerCapture(pointerId);
      } catch {
        /* ignore if pointer capture is unavailable */
      }
      current.start?.();
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (pointerId === null || event.pointerId !== pointerId) return;
      latestY = event.clientY;
      samples.push({ y: latestY, t: event.timeStamp });
      pruneSamples(event.timeStamp);
      if (rafId === null) {
        rafId = window.requestAnimationFrame(flushMove);
      }
    };

    const finish = (event: PointerEvent): void => {
      if (pointerId === null || event.pointerId !== pointerId) return;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }
      latestY = event.clientY;
      samples.push({ y: latestY, t: event.timeStamp });
      const velocity = computeVelocity(event.timeStamp);
      pointerId = null;
      handlersRef.current.end?.(latestY - startY, velocity);
    };

    target.addEventListener('pointerdown', onPointerDown);
    target.addEventListener('pointermove', onPointerMove, { passive: true });
    target.addEventListener('pointerup', finish);
    target.addEventListener('pointercancel', finish);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      target.removeEventListener('pointerdown', onPointerDown);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerup', finish);
      target.removeEventListener('pointercancel', finish);
    };
  }, [targetRef]);
}
