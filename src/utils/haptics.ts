export type HapticPattern =
  | 'tap'
  | 'tick'
  | 'transition'
  | 'longPress'
  | 'dragStart'
  | 'drop'
  | 'success'
  | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  tick: 6,
  transition: [8, 14, 12],
  longPress: [18, 22, 14],
  dragStart: 15,
  drop: [10, 14, 10],
  success: [12, 24, 18],
  error: [26, 36, 26, 36, 24],
};

let hapticsEnabled = true;
const lastDetentBucket = new Map<string, number>();

export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

export function triggerHaptic(pattern: HapticPattern = 'tap'): void {
  if (!hapticsEnabled) return;
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(PATTERNS[pattern]);
    } catch {
      /* ignore restricted vibration environments */
    }
  }
}

export function triggerDetentHaptic(key: string, value: number, step = 10): void {
  const bucket = Math.floor(value / step);
  const prev = lastDetentBucket.get(key);
  if (prev !== bucket) {
    lastDetentBucket.set(key, bucket);
    triggerHaptic('tick');
  }
}
