import { useRef } from 'react';
import { useDragY } from '../hooks/useDragY';
import { triggerHaptic } from '../utils/haptics';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { Glyph } from './Glyph';

export interface StatusBarProps {
  time: string;
  airplane: boolean;
  wifiOn: boolean;
  bluetoothOn: boolean;
  batterySaverOn: boolean;
  dndOn: boolean;
  drawerOpen: boolean;
  locked: boolean;
  onOpenShade: () => void;
  onDragShade: (offset: number | null) => void;
}

export function StatusBar({
  time,
  airplane,
  wifiOn,
  bluetoothOn,
  batterySaverOn,
  dndOn,
  drawerOpen,
  locked,
  onOpenShade,
  onDragShade,
}: StatusBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const isOnline = useOnlineStatus();

  useDragY(barRef, {
    zone: () => !drawerOpen && !locked,
    move: (delta) => {
      if (delta > 0) onDragShade(delta);
    },
    end: (delta) => {
      onDragShade(null);
      if (delta > 80) {
        triggerHaptic('transition');
        onOpenShade();
      }
    },
  });

  return (
    <div
      ref={barRef}
      className="statusbar"
      title={locked ? undefined : 'Swipe down for quick settings'}
      onClick={() => {
        if (!locked) {
          triggerHaptic('tap');
          onOpenShade();
        }
      }}
    >
      <span className="sb-time">{time}</span>
      <div className="sb-icons">
        {!isOnline && (
          <span className="sb-offline" title="Offline">
            <Glyph name="cloud_off" size={14} />
          </span>
        )}
        <span className="sb-dnd" hidden={!dndOn}>
          <Glyph name="do_not_disturb_on" size={14} filled />
        </span>
        <span className="sb-bt" hidden={!bluetoothOn || airplane}>
          <Glyph name="bluetooth" size={15} />
        </span>
        <span className="sb-airplane" hidden={!airplane}>
          <Glyph name="airplane" size={15} filled />
        </span>
        <span className="sb-signal" hidden={airplane}>
          <Glyph name="signal" size={16} />
        </span>
        <span className="sb-wifi" hidden={airplane || !wifiOn}>
          <Glyph name="wifi" size={16} />
        </span>
        <span className="sb-battery">
          <Glyph name={batterySaverOn ? 'battery_saver' : 'battery'} size={19} filled />
        </span>
      </div>
    </div>
  );
}
