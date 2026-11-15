import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { APP_CATEGORIES, type AppCategory, type AppDef } from '../data/apps';
import { useDragY } from '../hooks/useDragY';
import { triggerHaptic } from '../utils/haptics';
import { AppIcon } from './AppIcon';
import { FolderTile } from './FolderTile';
import { Glyph } from './Glyph';

export type DrawerTab = 'All' | AppCategory;
const DRAWER_TABS: DrawerTab[] = ['All', ...APP_CATEGORIES];

export interface AppDrawerProps {
  wrapperRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  apps: AppDef[];
  time: string;
  longDate: string;
  folderedView: boolean;
  onToggleFolderedView: () => void;
  onOpenFolder: (category: AppCategory) => void;
  onLaunch: (app: AppDef, originRect?: DOMRect) => void;
  onLongPressApp: (app: AppDef, rect: DOMRect) => void;
  onReorderApps: (sourceId: string, targetId: string) => void;
  onClose: () => void;
  onDrag: (offset: number | null) => void;
}

export function AppDrawer({
  wrapperRef,
  open,
  apps,
  time,
  longDate,
  folderedView,
  onToggleFolderedView,
  onOpenFolder,
  onLaunch,
  onLongPressApp,
  onReorderApps,
  onClose,
  onDrag,
}: AppDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<DrawerTab>('All');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const dragTimerRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const pointerStateRef = useRef<{
    app: AppDef;
    pointerId: number;
    startX: number;
    startY: number;
    isDragging: boolean;
    didLongPress: boolean;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setDraggingId(null);
      setOverId(null);
      if (gridRef.current) gridRef.current.scrollTop = 0;
    }
  }, [open]);

  const filteredApps = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return apps.filter((app) => {
      if (app.isShortcut) return false;
      const matchesTab = activeTab === 'All' || app.category === activeTab;
      const matchesQuery =
        needle === '' ||
        app.name.toLowerCase().includes(needle) ||
        app.id.includes(needle) ||
        app.category.toLowerCase().includes(needle);
      return matchesTab && matchesQuery;
    });
  }, [apps, activeTab, query]);

  useEffect(() => {
    for (const app of filteredApps) {
      iconRefs.current[app.id]?.style.setProperty('--app-color', app.color);
    }
  }, [filteredApps, folderedView, activeTab]);

  useEffect(() => {
    return () => {
      if (dragTimerRef.current !== null) window.clearTimeout(dragTimerRef.current);
      if (longPressTimerRef.current !== null) window.clearTimeout(longPressTimerRef.current);
    };
  }, []);

  useDragY(panelRef, {
    zone: (event) =>
      open &&
      draggingId === null &&
      (event.target as HTMLElement).closest('.drawer-head, .drawer-handle, .drawer-hint') !== null &&
      (event.target as HTMLElement).closest('button') === null,
    move: (delta) => {
      if (delta > 0) onDrag(delta);
    },
    end: (delta, velocity) => {
      onDrag(null);
      if (delta > 80 || velocity > 0.5) {
        triggerHaptic('transition');
        onClose();
      }
    },
  });

  function clearTimers(): void {
    if (dragTimerRef.current !== null) {
      window.clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleTilePointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    app: AppDef,
  ): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    clearTimers();
    const targetEl = event.currentTarget;

    pointerStateRef.current = {
      app,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      isDragging: false,
      didLongPress: false,
    };

    dragTimerRef.current = window.setTimeout(() => {
      if (!pointerStateRef.current) return;
      pointerStateRef.current.isDragging = true;
      setDraggingId(app.id);
      setOverId(app.id);
      triggerHaptic('dragStart');
      try {
        targetEl.setPointerCapture(event.pointerId);
      } catch {
        /* ignore if pointer already ended */
      }
    }, 180);

    longPressTimerRef.current = window.setTimeout(() => {
      const state = pointerStateRef.current;
      if (!state || state.isDragging) return;
      state.didLongPress = true;
      setDraggingId(null);
      setOverId(null);
      triggerHaptic('longPress');
      const rect = targetEl.getBoundingClientRect();
      onLongPressApp(app, rect);
    }, 560);
  }

  function handleTilePointerMove(event: React.PointerEvent<HTMLButtonElement>): void {
    const state = pointerStateRef.current;
    if (!state || event.pointerId !== state.pointerId) return;

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    const dist = Math.hypot(dx, dy);

    if (!state.isDragging) {
      if (dist > 8) {
        if (longPressTimerRef.current !== null) {
          window.clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        if (Math.abs(dx) > Math.abs(dy) && event.pointerType === 'mouse') {
          if (dragTimerRef.current !== null) {
            window.clearTimeout(dragTimerRef.current);
            dragTimerRef.current = null;
          }
          state.isDragging = true;
          setDraggingId(state.app.id);
          setOverId(state.app.id);
          triggerHaptic('dragStart');
        } else {
          clearTimers();
          pointerStateRef.current = null;
        }
      }
      return;
    }

    if (longPressTimerRef.current !== null && dist > 6) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const hovered = document.elementFromPoint(event.clientX, event.clientY);
    const tile = hovered?.closest<HTMLElement>('[data-drawer-app-id]');
    const targetId = tile?.dataset.drawerAppId ?? null;
    if (targetId && targetId !== overId) {
      setOverId(targetId);
      triggerHaptic('tick');
    }
  }

  function handleTilePointerEnd(event: React.PointerEvent<HTMLButtonElement>): void {
    clearTimers();
    const state = pointerStateRef.current;
    pointerStateRef.current = null;
    if (!state) return;

    if (event.currentTarget.hasPointerCapture(state.pointerId)) {
      event.currentTarget.releasePointerCapture(state.pointerId);
    }

    if (state.isDragging) {
      if (overId && overId !== state.app.id) {
        onReorderApps(state.app.id, overId);
        triggerHaptic('drop');
      }
      setDraggingId(null);
      setOverId(null);
      return;
    }

    if (state.didLongPress) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
  }

  const showFolderGrid = folderedView && activeTab === 'All' && query.trim() === '';

  return (
    <div ref={wrapperRef} className={`drawer${open ? ' open' : ''}`}>
      <div
        ref={panelRef}
        className="drawer-panel"
        role="dialog"
        aria-label="All apps"
      >
        <div className="drawer-handle" aria-hidden="true" />

        <div className="drawer-head">
          <div className="drawer-head-info">
            <div className="drawer-time">{time}</div>
            <div className="drawer-date">{longDate}</div>
          </div>

          <button
            type="button"
            className={`drawer-view-btn${folderedView ? ' active' : ''}`}
            aria-label={folderedView ? 'Switch to grid view' : 'Switch to foldered view'}
            onClick={() => {
              triggerHaptic('tick');
              onToggleFolderedView();
            }}
          >
            <Glyph name={folderedView ? 'apps' : 'folder'} size={17} filled={folderedView} />
            <span>{folderedView ? 'Folders' : 'Grid'}</span>
          </button>
        </div>

        <label className="drawer-search">
          <Glyph name="search" size={18} />
          <input
            type="search"
            placeholder="Search apps"
            aria-label="Search apps"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query !== '' && (
            <button
              type="button"
              className="drawer-search-clear"
              aria-label="Clear search"
              onClick={() => {
                triggerHaptic('tick');
                setQuery('');
              }}
            >
              <Glyph name="close" size={16} />
            </button>
          )}
        </label>

        <div className="drawer-tabs" role="tablist" aria-label="App categories">
          {DRAWER_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`drawer-tab${isActive ? ' active' : ''}`}
                onClick={() => {
                  triggerHaptic('tick');
                  setActiveTab(tab);
                  if (gridRef.current) gridRef.current.scrollTop = 0;
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {showFolderGrid ? (
          <div key={`${activeTab}-folders`} ref={gridRef} className="app-grid drawer-grid drawer-folder-grid">
            {APP_CATEGORIES.map((category) => {
              const catApps = apps.filter(
                (app) => !app.isShortcut && app.category === category,
              );
              if (catApps.length === 0) return null;
              return (
                <FolderTile
                  key={category}
                  category={category}
                  apps={catApps}
                  onOpen={onOpenFolder}
                />
              );
            })}
          </div>
        ) : (
          <div
            key={`${activeTab}-grid`}
            ref={gridRef}
            className="app-grid drawer-grid"
            hidden={filteredApps.length === 0}
          >
            {filteredApps.map((app) => {
              const isDragging = draggingId === app.id;
              const isDropTarget = overId === app.id && draggingId !== null && draggingId !== app.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  className={`app drawer-app${isDragging ? ' is-dragging' : ''}${
                    isDropTarget ? ' is-drop-target' : ''
                  }`}
                  data-drawer-app-id={app.id}
                  title={app.name}
                  aria-label={`Open ${app.name}`}
                  onPointerDown={(event) => handleTilePointerDown(event, app)}
                  onPointerMove={handleTilePointerMove}
                  onPointerUp={handleTilePointerEnd}
                  onPointerCancel={handleTilePointerEnd}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    clearTimers();
                    triggerHaptic('longPress');
                    onLongPressApp(app, event.currentTarget.getBoundingClientRect());
                  }}
                  onClick={() => {
                    if (draggingId || pointerStateRef.current?.didLongPress) return;
                    triggerHaptic('tap');
                    onLaunch(app, iconRefs.current[app.id]?.getBoundingClientRect());
                  }}
                >
                  <span
                    ref={(node) => {
                      iconRefs.current[app.id] = node;
                    }}
                    className="app-icon"
                  >
                    <AppIcon icon={app.faIcon} size={22} />
                  </span>
                  <span className="app-label">{app.name}</span>
                </button>
              );
            })}
          </div>
        )}

        <p className="drawer-empty" hidden={showFolderGrid || filteredApps.length > 0}>
          No matching apps
        </p>
      </div>
    </div>
  );
}
