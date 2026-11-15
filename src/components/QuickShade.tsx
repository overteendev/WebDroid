import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useDragY } from '../hooks/useDragY';
import { triggerDetentHaptic, triggerHaptic } from '../utils/haptics';
import type { ThemeMode } from '../utils/theme';
import { AppIcon } from './AppIcon';
import { Glyph } from './Glyph';

export type QuickTileId =
  | 'wifi'
  | 'bluetooth'
  | 'dnd'
  | 'flashlight'
  | 'airplane'
  | 'battery-saver'
  | 'dark'
  | 'rotate';

export const DEFAULT_TILE_ORDER: QuickTileId[] = [
  'wifi',
  'bluetooth',
  'dnd',
  'flashlight',
  'airplane',
  'battery-saver',
  'dark',
  'rotate',
];

interface TileDef {
  id: QuickTileId;
  label: string;
  icon: string;
  on: boolean;
}

interface NotificationItem {
  id: string;
  app: string;
  color: string;
  faIcon: string;
  title: string;
  body: string;
  time: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    app: 'Gmail',
    color: '#D93025',
    faIcon: 'fa-solid fa-envelope',
    title: 'Your weekly digest',
    body: '4 new pull requests and 2 review requests are waiting.',
    time: '2m',
  },
  {
    id: 'n2',
    app: 'Calendar',
    color: '#1A73E8',
    faIcon: 'fa-solid fa-calendar-days',
    title: 'Standup in 15 minutes',
    body: 'Meet · 10:30 – 10:45',
    time: '5m',
  },
  {
    id: 'n3',
    app: 'Spotify',
    color: '#1AA34A',
    faIcon: 'fa-brands fa-spotify',
    title: 'Continue listening',
    body: 'Lo-fi focus · 1h 12m left in this playlist.',
    time: '18m',
  },
];

export interface QuickShadeProps {
  wrapperRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  time: string;
  longDate: string;
  mode: ThemeMode;
  brightness: number;
  wifiOn: boolean;
  bluetoothOn: boolean;
  dndOn: boolean;
  flashlightOn: boolean;
  airplane: boolean;
  batterySaverOn: boolean;
  rotationLockOn: boolean;
  tileOrder: QuickTileId[];
  onClose: () => void;
  onDrag: (offset: number | null) => void;
  onModeChange: (mode: ThemeMode) => void;
  onBrightnessChange: (value: number) => void;
  onWifiChange: (on: boolean) => void;
  onBluetoothChange: (on: boolean) => void;
  onDndChange: (on: boolean) => void;
  onFlashlightChange: (on: boolean) => void;
  onAirplaneChange: (on: boolean) => void;
  onBatterySaverChange: (on: boolean) => void;
  onRotationLockChange: (on: boolean) => void;
  onReorderTiles: (sourceId: QuickTileId, targetId: QuickTileId) => void;
  onResetTileOrder: () => void;
  onLockScreen: () => void;
  onOpenSettings: () => void;
}

export function QuickShade({
  wrapperRef,
  open,
  time,
  longDate,
  mode,
  brightness,
  wifiOn,
  bluetoothOn,
  dndOn,
  flashlightOn,
  airplane,
  batterySaverOn,
  rotationLockOn,
  tileOrder,
  onClose,
  onDrag,
  onModeChange,
  onBrightnessChange,
  onWifiChange,
  onBluetoothChange,
  onDndChange,
  onFlashlightChange,
  onAirplaneChange,
  onBatterySaverChange,
  onRotationLockChange,
  onReorderTiles,
  onResetTileOrder,
  onLockScreen,
  onOpenSettings,
}: QuickShadeProps) {
  const panelRef = useRef<HTMLElement>(null);
  const brightnessRef = useRef<HTMLDivElement>(null);
  const notifIconRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const tileRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dragRafRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const [editingTiles, setEditingTiles] = useState(false);
  const [draggingId, setDraggingId] = useState<QuickTileId | null>(null);
  const [overId, setOverId] = useState<QuickTileId | null>(null);
  const overIdRef = useRef<QuickTileId | null>(null);

  const dragStateRef = useRef<{
    id: QuickTileId;
    pointerId: number;
    startX: number;
    startY: number;
    latestX: number;
    latestY: number;
    isDragging: boolean;
    didLongPress: boolean;
    el: HTMLButtonElement;
  } | null>(null);

  const tileMap = useMemo<Record<QuickTileId, TileDef>>(
    () => ({
      wifi: {
        id: 'wifi',
        label: wifiOn && !airplane ? 'PixelNet_5G' : 'Wi-Fi',
        icon: 'wifi',
        on: wifiOn && !airplane,
      },
      bluetooth: {
        id: 'bluetooth',
        label: bluetoothOn && !airplane ? 'Buds Pro' : 'Bluetooth',
        icon: 'bluetooth',
        on: bluetoothOn && !airplane,
      },
      dnd: { id: 'dnd', label: 'Do Not Disturb', icon: 'do_not_disturb_on', on: dndOn },
      flashlight: { id: 'flashlight', label: 'Flashlight', icon: 'flashlight_on', on: flashlightOn },
      airplane: { id: 'airplane', label: 'Airplane mode', icon: 'airplanemode_active', on: airplane },
      'battery-saver': {
        id: 'battery-saver',
        label: 'Battery saver',
        icon: 'battery_saver',
        on: batterySaverOn,
      },
      dark: { id: 'dark', label: 'Dark theme', icon: 'dark_mode', on: mode === 'dark' },
      rotate: {
        id: 'rotate',
        label: 'Rotation lock',
        icon: 'screen_lock_rotation',
        on: rotationLockOn,
      },
    }),
    [wifiOn, airplane, bluetoothOn, dndOn, flashlightOn, batterySaverOn, mode, rotationLockOn],
  );

  const tiles = useMemo<TileDef[]>(() => {
    const seen = new Set<QuickTileId>();
    const list: TileDef[] = [];
    for (const id of tileOrder) {
      if (id in tileMap && !seen.has(id)) {
        seen.add(id);
        list.push(tileMap[id]);
      }
    }
    for (const id of DEFAULT_TILE_ORDER) {
      if (!seen.has(id)) {
        seen.add(id);
        list.push(tileMap[id]);
      }
    }
    return list;
  }, [tileOrder, tileMap]);

  const isCustomOrder = useMemo(
    () => tiles.some((tile, idx) => tile.id !== DEFAULT_TILE_ORDER[idx]),
    [tiles],
  );

  function clearLongPress(): void {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function resetTileDragTransform(el: HTMLButtonElement | null): void {
    if (!el) return;
    el.style.removeProperty('--tile-dx');
    el.style.removeProperty('--tile-dy');
  }

  useEffect(() => {
    if (!open) {
      clearLongPress();
      if (dragRafRef.current !== null) {
        window.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      if (dragStateRef.current) {
        resetTileDragTransform(dragStateRef.current.el);
        dragStateRef.current = null;
      }
      setEditingTiles(false);
      setDraggingId(null);
      overIdRef.current = null;
      setOverId(null);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      clearLongPress();
      if (dragRafRef.current !== null) window.cancelAnimationFrame(dragRafRef.current);
    };
  }, []);

  useEffect(() => {
    const min = 20;
    const max = 100;
    const ratio = (brightness - min) / (max - min);
    brightnessRef.current?.style.setProperty('--fill', `${Math.round(ratio * 100)}%`);
  }, [brightness]);

  useEffect(() => {
    for (const item of notifications) {
      notifIconRefs.current[item.id]?.style.setProperty('background', item.color);
    }
  }, [notifications, dndOn]);

  useDragY(panelRef, {
    zone: (event) =>
      open &&
      draggingId === null &&
      (event.target as HTMLElement).closest('.shade-head, .shade-handle') !== null &&
      (event.target as HTMLElement).closest('button') === null,
    move: (delta) => {
      if (delta < 0) onDrag(delta);
    },
    end: (delta, velocity) => {
      onDrag(null);
      if (delta < -70 || velocity < -0.5) {
        triggerHaptic('transition');
        onClose();
      }
    },
  });

  function handleTileClick(clicked: TileDef): void {
    if (editingTiles) return;
    triggerHaptic('tap');

    switch (clicked.id) {
      case 'wifi': {
        const next = !wifiOn;
        onWifiChange(next);
        if (next && airplane) onAirplaneChange(false);
        break;
      }
      case 'bluetooth': {
        const next = !bluetoothOn;
        onBluetoothChange(next);
        if (next && airplane) onAirplaneChange(false);
        break;
      }
      case 'dnd':
        onDndChange(!dndOn);
        break;
      case 'flashlight':
        onFlashlightChange(!flashlightOn);
        break;
      case 'airplane': {
        const next = !airplane;
        onAirplaneChange(next);
        if (next) {
          onWifiChange(false);
          onBluetoothChange(false);
        } else {
          onWifiChange(true);
        }
        break;
      }
      case 'battery-saver':
        onBatterySaverChange(!batterySaverOn);
        break;
      case 'dark':
        onModeChange(mode === 'dark' ? 'light' : 'dark');
        break;
      case 'rotate':
        onRotationLockChange(!rotationLockOn);
        break;
      default:
        break;
    }
  }

  function flushTileDrag(): void {
    dragRafRef.current = null;
    const state = dragStateRef.current;
    if (!state || !state.isDragging) return;

    const dx = state.latestX - state.startX;
    const dy = state.latestY - state.startY;
    state.el.style.setProperty('--tile-dx', `${dx.toFixed(1)}px`);
    state.el.style.setProperty('--tile-dy', `${dy.toFixed(1)}px`);

    const hovered = document.elementFromPoint(state.latestX, state.latestY);
    const tileEl = hovered?.closest<HTMLElement>('[data-tile]');
    const targetId = tileEl?.dataset.tile as QuickTileId | undefined;
    if (targetId && targetId in tileMap && targetId !== overIdRef.current) {
      overIdRef.current = targetId;
      setOverId(targetId);
      triggerHaptic('tick');
    } else if (!targetId && overIdRef.current !== state.id) {
      overIdRef.current = state.id;
      setOverId(state.id);
    }
  }

  function handleTilePointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    tile: TileDef,
  ): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    clearLongPress();
    const el = event.currentTarget;

    dragStateRef.current = {
      id: tile.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      latestX: event.clientX,
      latestY: event.clientY,
      isDragging: false,
      didLongPress: false,
      el,
    };

    if (editingTiles) {
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        /* ignore if pointer capture fails */
      }
      return;
    }

    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      const state = dragStateRef.current;
      if (!state) return;
      state.didLongPress = true;
      state.isDragging = true;
      setEditingTiles(true);
      setDraggingId(tile.id);
      overIdRef.current = tile.id;
      setOverId(tile.id);
      triggerHaptic('longPress');
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        /* ignore if pointer capture fails */
      }
    }, 460);
  }

  function handleTilePointerMove(event: React.PointerEvent<HTMLButtonElement>): void {
    const state = dragStateRef.current;
    if (!state || event.pointerId !== state.pointerId) return;

    state.latestX = event.clientX;
    state.latestY = event.clientY;
    const dist = Math.hypot(state.latestX - state.startX, state.latestY - state.startY);

    if (!editingTiles) {
      if (dist > 8 && !state.isDragging) {
        clearLongPress();
        dragStateRef.current = null;
      }
      return;
    }

    if (!state.isDragging) {
      if (dist < 6) return;
      state.isDragging = true;
      setDraggingId(state.id);
      overIdRef.current = state.id;
      setOverId(state.id);
      triggerHaptic('dragStart');
    }

    if (dragRafRef.current === null) {
      dragRafRef.current = window.requestAnimationFrame(flushTileDrag);
    }
  }

  function handleTilePointerEnd(event: React.PointerEvent<HTMLButtonElement>): void {
    clearLongPress();
    if (dragRafRef.current !== null) {
      window.cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }

    const state = dragStateRef.current;
    dragStateRef.current = null;
    if (!state) return;

    if (event.currentTarget.hasPointerCapture(state.pointerId)) {
      event.currentTarget.releasePointerCapture(state.pointerId);
    }

    resetTileDragTransform(state.el);

    if (state.isDragging) {
      const hovered = document.elementFromPoint(event.clientX, event.clientY);
      const tileEl = hovered?.closest<HTMLElement>('[data-tile]');
      const finalTarget =
        (tileEl?.dataset.tile as QuickTileId | undefined) ?? overIdRef.current;

      if (finalTarget && finalTarget in tileMap && finalTarget !== state.id) {
        onReorderTiles(state.id, finalTarget);
        triggerHaptic('drop');
      } else {
        triggerHaptic('tick');
      }
    }

    setDraggingId(null);
    overIdRef.current = null;
    setOverId(null);
  }

  function dismissNotification(id: string): void {
    if (removingIds.includes(id)) return;
    triggerHaptic('tick');
    setRemovingIds((prev) => [...prev, id]);
    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      setRemovingIds((prev) => prev.filter((item) => item !== id));
    }, 220);
  }

  return (
    <div
      ref={wrapperRef}
      className={`shade${open ? ' open' : ''}`}
      aria-hidden={!open}
    >
      <section ref={panelRef} className="shade-panel" aria-label="Quick settings">
        <header className="shade-head">
          <div>
            <div className="shade-clock">{time}</div>
            <div className="shade-date">{longDate}</div>
          </div>
          <div className="shade-head-actions">
            <button
              type="button"
              className={`shade-icon-btn${editingTiles ? ' active' : ''}`}
              aria-label={editingTiles ? 'Done editing tiles' : 'Edit quick settings tiles'}
              aria-pressed={editingTiles}
              onClick={() => {
                triggerHaptic(editingTiles ? 'success' : 'tap');
                setEditingTiles((prev) => !prev);
              }}
            >
              <Glyph name={editingTiles ? 'check' : 'edit'} size={18} />
            </button>
            <button
              type="button"
              className="shade-icon-btn"
              aria-label="Lock screen"
              onClick={() => {
                triggerHaptic('transition');
                onLockScreen();
              }}
            >
              <Glyph name="lock" size={18} />
            </button>
            <button
              type="button"
              className="shade-icon-btn"
              aria-label="Open settings"
              onClick={() => {
                triggerHaptic('tap');
                onOpenSettings();
              }}
            >
              <Glyph name="settings" size={18} />
            </button>
            <button
              type="button"
              className="shade-icon-btn"
              aria-label="Close quick settings"
              onClick={() => {
                triggerHaptic('tick');
                onClose();
              }}
            >
              <Glyph name="keyboard_arrow_up" size={20} />
            </button>
          </div>
        </header>

        <div className={`tiles${editingTiles ? ' editing' : ''}`}>
          {tiles.map((tile) => {
            const isDragging = draggingId === tile.id;
            const isDropTarget =
              overId === tile.id && draggingId !== null && draggingId !== tile.id;

            return (
              <button
                key={tile.id}
                ref={(node) => {
                  tileRefs.current[tile.id] = node;
                }}
                type="button"
                className={`tile${tile.on ? ' on' : ''}${editingTiles ? ' editing' : ''}${
                  isDragging ? ' is-dragging' : ''
                }${isDropTarget ? ' is-drop-target' : ''}`}
                data-tile={tile.id}
                aria-pressed={editingTiles ? undefined : tile.on}
                aria-label={editingTiles ? `Drag to reorder ${tile.label}` : tile.label}
                onPointerDown={(event) => handleTilePointerDown(event, tile)}
                onPointerMove={handleTilePointerMove}
                onPointerUp={handleTilePointerEnd}
                onPointerCancel={handleTilePointerEnd}
                onContextMenu={(event) => event.preventDefault()}
                onClick={() => handleTileClick(tile)}
              >
                <span className="tile-icon">
                  <Glyph name={tile.icon} size={18} filled={tile.on} />
                </span>
                <span className="tile-label">{tile.label}</span>
                {editingTiles && (
                  <span className="tile-drag-grip" aria-hidden="true">
                    <Glyph name="drag_indicator" size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {editingTiles && (
          <div className="tiles-edit-bar">
            <span className="tiles-edit-title">Drag tiles to reorder</span>
            <div className="tiles-edit-actions">
              {isCustomOrder && (
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    triggerHaptic('drop');
                    onResetTileOrder();
                  }}
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                className="tiles-done-btn"
                onClick={() => {
                  triggerHaptic('success');
                  setEditingTiles(false);
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        <div ref={brightnessRef} className="brightness">
          <Glyph name="brightness_low" size={17} />
          <input
            type="range"
            min={20}
            max={100}
            step={1}
            value={brightness}
            aria-label="Screen brightness"
            onChange={(event) => {
              const val = Number(event.target.value);
              triggerDetentHaptic('shade-brightness', val);
              onBrightnessChange(val);
            }}
          />
          <Glyph name="brightness_high" size={20} />
        </div>

        <div className="notif-head">
          <span>Notifications</span>
          <button
            type="button"
            className="text-btn"
            hidden={dndOn || notifications.length === 0}
            onClick={() => {
              triggerHaptic('drop');
              setNotifications([]);
            }}
          >
            Clear all
          </button>
        </div>

        <div className="notif-list" hidden={dndOn}>
          {notifications.length === 0 ? (
            <p className="shade-note">No notifications</p>
          ) : (
            notifications.map((item) => (
              <article
                key={item.id}
                className={`notif${removingIds.includes(item.id) ? ' removing' : ''}`}
              >
                <span
                  ref={(node) => {
                    notifIconRefs.current[item.id] = node;
                  }}
                  className="notif-icon"
                >
                  <AppIcon icon={item.faIcon} size={14} />
                </span>
                <div className="notif-main">
                  <div className="notif-meta">
                    <span>{item.app}</span>
                    <span className="notif-dot">•</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="notif-title">{item.title}</div>
                  <div className="notif-body">{item.body}</div>
                </div>
                <button
                  type="button"
                  className="notif-close"
                  aria-label={`Dismiss ${item.app} notification`}
                  onClick={() => dismissNotification(item.id)}
                >
                  <Glyph name="close" size={14} />
                </button>
              </article>
            ))
          )}
        </div>

        <p className="shade-note" hidden={!dndOn}>
          Notifications silenced
        </p>

        <div
          className="shade-handle"
          role="button"
          tabIndex={0}
          aria-label="Close quick settings"
          onClick={() => {
            triggerHaptic('tick');
            onClose();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              triggerHaptic('tick');
              onClose();
            }
          }}
        />
      </section>
    </div>
  );
}
