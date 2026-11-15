import { useRef } from 'react';
import { useDragY } from '../hooks/useDragY';
import { triggerHaptic } from '../utils/haptics';
import { Glyph } from './Glyph';

export interface NavBarProps {
  gestureNav: boolean;
  hasOverlay: boolean;
  onBack: () => void;
  onHome: () => void;
  onOpenDrawer: () => void;
}

export function NavBar({
  gestureNav,
  hasOverlay,
  onBack,
  onHome,
  onOpenDrawer,
}: NavBarProps) {
  const pillRef = useRef<HTMLButtonElement>(null);

  useDragY(pillRef, {
    zone: () => gestureNav,
    move: (delta) => {
      if (!pillRef.current) return;
      const clamped = Math.max(-20, Math.min(0, delta * 0.25));
      pillRef.current.style.transform = `translateY(${clamped}px) scaleX(1.06)`;
    },
    end: (delta, velocity) => {
      if (pillRef.current) {
        pillRef.current.style.transform = '';
      }
      if (delta < -28 || velocity < -0.35) {
        triggerHaptic('tap');
        if (hasOverlay) {
          onHome();
        } else {
          onOpenDrawer();
        }
      }
    },
  });

  return (
    <div className={`navbar${gestureNav ? ' gesture-mode' : ' classic-mode'}`}>
      <button
        type="button"
        className="nav-back"
        aria-label="Back"
        hidden={gestureNav}
        onClick={() => {
          triggerHaptic('tick');
          onBack();
        }}
      >
        <Glyph name="arrow_back" size={20} />
      </button>
      <button
        ref={pillRef}
        type="button"
        className="nav-pill"
        aria-label="Go to home screen"
        onClick={() => {
          triggerHaptic('tap');
          onHome();
        }}
      />
    </div>
  );
}
