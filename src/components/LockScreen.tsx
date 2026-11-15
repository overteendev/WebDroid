import { useCallback, useEffect, useRef, useState } from 'react';
import { rubberBand, useDragY } from '../hooks/useDragY';
import { triggerHaptic } from '../utils/haptics';
import { formatTemp, type TempUnit, type WeatherSnapshot } from '../utils/weather';
import { ClockWidget } from './ClockWidget';
import { Glyph } from './Glyph';

export interface LockScreenProps {
  open: boolean;
  wakeKey: number;
  time: string;
  compactDate: string;
  longDate: string;
  hours: number;
  minutes: number;
  seconds: number;
  weather: WeatherSnapshot;
  tempUnit: TempUnit;
  flashlightOn: boolean;
  onToggleFlashlight: () => void;
  onOpenCamera: (originRect?: DOMRect) => void;
  onUnlockProgress?: (progress: number | null) => void;
  onUnlock: () => void;
}

const UNLOCK_THRESHOLD_PX = 90;

export function LockScreen({
  open,
  wakeKey,
  time,
  compactDate,
  longDate,
  hours,
  minutes,
  seconds,
  weather,
  tempUnit,
  flashlightOn,
  onToggleFlashlight,
  onOpenCamera,
  onUnlockProgress,
  onUnlock,
}: LockScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cameraBtnRef = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);
  const [readyToUnlock, setReadyToUnlock] = useState(false);
  const [waking, setWaking] = useState(false);
  const [fpUnlocking, setFpUnlocking] = useState(false);

  const readyRef = useRef(false);
  const fpTimerRef = useRef<number | null>(null);

  const clearFpTimer = useCallback(() => {
    if (fpTimerRef.current !== null) {
      window.clearTimeout(fpTimerRef.current);
      fpTimerRef.current = null;
    }
  }, []);

  const resetDragStyles = useCallback(() => {
    const el = overlayRef.current;
    if (el) {
      el.style.transform = '';
      el.style.opacity = '';
    }
    onUnlockProgress?.(null);
    setDragging(false);
    setReadyToUnlock(false);
    readyRef.current = false;
  }, [onUnlockProgress]);

  useEffect(() => {
    clearFpTimer();
    if (!open) {
      resetDragStyles();
      setFpUnlocking(false);
      return;
    }
    setFpUnlocking(false);
    setWaking(true);
    const timer = window.setTimeout(() => setWaking(false), 420);
    return () => window.clearTimeout(timer);
  }, [open, wakeKey, resetDragStyles, clearFpTimer]);

  useEffect(() => clearFpTimer, [clearFpTimer]);

  const handleDirectUnlock = useCallback(() => {
    if (fpUnlocking) return;
    triggerHaptic('success');
    onUnlock();
  }, [fpUnlocking, onUnlock]);

  const handleFingerprintTap = useCallback(() => {
    if (!open || fpUnlocking) return;
    triggerHaptic('success');
    setFpUnlocking(true);
    onUnlockProgress?.(0.35);
    clearFpTimer();
    fpTimerRef.current = window.setTimeout(() => {
      onUnlock();
    }, 180);
  }, [open, fpUnlocking, onUnlockProgress, clearFpTimer, onUnlock]);

  useDragY(overlayRef, {
    zone: (event) => {
      if (!open || fpUnlocking) return false;
      const target = event.target as HTMLElement;
      return target.closest('.lock-action-btn, .lock-fp-btn') === null;
    },
    start: () => {
      setDragging(true);
      readyRef.current = false;
    },
    move: (deltaY) => {
      const el = overlayRef.current;
      if (!el) return;
      if (deltaY > 0) {
        const damped = rubberBand(deltaY, 36, 0.25);
        el.style.transform = `translate3d(0, ${damped.toFixed(1)}px, 0) scale(1)`;
        el.style.opacity = '1';
        onUnlockProgress?.(0);
        return;
      }
      const upward = deltaY;
      const progress = Math.min(1, Math.abs(upward) / 240);
      const scale = (1 - progress * 0.045).toFixed(3);
      el.style.transform = `translate3d(0, ${upward.toFixed(1)}px, 0) scale(${scale})`;
      el.style.opacity = (1 - progress * 0.62).toFixed(3);
      onUnlockProgress?.(progress);

      const isReady = upward <= -UNLOCK_THRESHOLD_PX;
      if (isReady !== readyRef.current) {
        readyRef.current = isReady;
        setReadyToUnlock(isReady);
        if (isReady) triggerHaptic('tick');
      }
    },
    end: (deltaY, velocity) => {
      resetDragStyles();
      if (deltaY < -UNLOCK_THRESHOLD_PX || velocity < -0.42) {
        handleDirectUnlock();
      }
    },
  });

  return (
    <section
      ref={overlayRef}
      className={`lockscreen${open ? ' open' : ''}${dragging ? ' dragging' : ''}${waking ? ' waking' : ''}${readyToUnlock ? ' unlock-ready' : ''}${fpUnlocking ? ' fp-unlocking' : ''}`}
      aria-hidden={!open}
      aria-label="Lock screen"
    >
      <div className="lock-top">
        <span className="lock-status-badge" aria-hidden="true">
          <Glyph name={readyToUnlock || fpUnlocking ? 'lock_open' : 'lock'} size={18} filled />
        </span>
      </div>

      <div className="lock-center">
        <ClockWidget
          compactDate={compactDate}
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          size="lg"
        />

        <div className="lock-digital-time">{time}</div>

        <div className="lock-meta">
          <span>{longDate}</span>
          <span aria-hidden="true">·</span>
          <span className="lock-weather-inline">
            <Glyph name={weather.icon} size={15} filled />
            <span>{formatTemp(weather.tempC, tempUnit)}</span>
          </span>
        </div>
      </div>

      <div className="lock-lower">
        <div className="lock-fp-slot">
          <button
            type="button"
            className={`lock-fp-btn${fpUnlocking ? ' scanning' : ''}`}
            aria-label="Unlock with fingerprint"
            onClick={handleFingerprintTap}
          >
            <span className="lock-fp-wave" aria-hidden="true" />
            <span className="lock-fp-ring" aria-hidden="true" />
            <Glyph name="fingerprint" size={34} />
          </button>
        </div>

        <div className="lock-bottom">
          <button
            type="button"
            className={`lock-action-btn${flashlightOn ? ' active' : ''}`}
            aria-label="Toggle flashlight"
            aria-pressed={flashlightOn}
            onClick={() => {
              triggerHaptic('tap');
              onToggleFlashlight();
            }}
          >
            <Glyph name="flashlight_on" size={20} filled={flashlightOn} />
          </button>

          <button
            ref={cameraBtnRef}
            type="button"
            className="lock-action-btn"
            aria-label="Open camera"
            onClick={() => {
              triggerHaptic('transition');
              onOpenCamera(cameraBtnRef.current?.getBoundingClientRect());
            }}
          >
            <Glyph name="photo_camera" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
