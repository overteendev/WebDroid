import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppContextMenu, type ContextMenuTarget } from './components/AppContextMenu';
import { AppDrawer } from './components/AppDrawer';
import { AppInfoModal } from './components/AppInfoModal';
import { EdgeBackGesture, type BackSensitivity } from './components/EdgeBackGesture';
import { FolderOverlay } from './components/FolderOverlay';
import { Glyph } from './components/Glyph';
import { HomeScreen } from './components/HomeScreen';
import { LaunchOverlay, type LaunchOrigin } from './components/LaunchOverlay';
import { LockScreen } from './components/LockScreen';
import { NavBar } from './components/NavBar';
import { DEFAULT_TILE_ORDER, QuickShade, type QuickTileId } from './components/QuickShade';
import { SettingsView, type ScreenTimeout } from './components/SettingsView';
import { StatusBar } from './components/StatusBar';
import { WeatherOverlay } from './components/WeatherOverlay';
import { apps as baseApps, type AppCategory, type AppDef } from './data/apps';
import { useClock } from './hooks/useClock';
import { useDragY } from './hooks/useDragY';
import { setHapticsEnabled, triggerHaptic } from './utils/haptics';
import { applyTheme, type ThemeMode } from './utils/theme';
import { processCustomWallpaperFile, wallpapers } from './utils/wallpaper';
import {
  getNextWeatherIndex,
  getWeatherSnapshot,
  type TempUnit,
} from './utils/weather';

const PREFS_KEY = 'material_you_launcher_prefs_v2';

const SCREEN_TIMEOUT_MS: Record<ScreenTimeout, number> = {
  '30s': 30000,
  '1m': 60000,
  '2m': 120000,
  '5m': 300000,
};

interface StoredPrefs {
  mode?: ThemeMode;
  themedIcons?: boolean;
  wallpaperIndex?: number;
  customWallpaperUrl?: string | null;
  customWallpaperHue?: number | null;
  brightness?: number;
  tempUnit?: TempUnit;
  gestureNav?: boolean;
  backSensitivity?: BackSensitivity;
  lockOnWake?: boolean;
  hapticsEnabled?: boolean;
  dndOn?: boolean;
  wifiOn?: boolean;
  bluetoothOn?: boolean;
  batterySaverOn?: boolean;
  rotationLockOn?: boolean;
  screenTimeout?: ScreenTimeout;
  mediaVolume?: number;
  ringVolume?: number;
  deviceName?: string;
  developerMode?: boolean;
  drawerFolderedDefault?: boolean;
  appOrder?: string[];
  tileOrder?: QuickTileId[];
  uninstalledIds?: string[];
  shortcutIds?: string[];
}

function loadPrefs(): StoredPrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredPrefs;
  } catch {
    return {};
  }
}

export default function App() {
  const initialPrefs = useMemo(() => loadPrefs(), []);

  const screenRef = useRef<HTMLDivElement>(null);
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const shadeWrapperRef = useRef<HTMLDivElement>(null);
  const drawerWrapperRef = useRef<HTMLDivElement>(null);

  const toastTimerRef = useRef<number | null>(null);
  const launchTimerRef = useRef<number | null>(null);
  const buildTapCountRef = useRef<number>(0);
  const buildTapResetRef = useRef<number | null>(null);
  const hiddenAtRef = useRef<number | null>(null);

  const clock = useClock();

  const [mode, setMode] = useState<ThemeMode>(
    () =>
      initialPrefs.mode ??
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
  );
  const [themedIcons, setThemedIcons] = useState<boolean>(
    () => initialPrefs.themedIcons ?? true,
  );
  const [wallpaperIndex, setWallpaperIndex] = useState<number>(
    () => initialPrefs.wallpaperIndex ?? 0,
  );
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string | null>(
    () => initialPrefs.customWallpaperUrl ?? null,
  );
  const [customWallpaperHue, setCustomWallpaperHue] = useState<number | null>(
    () => initialPrefs.customWallpaperHue ?? null,
  );
  const [brightness, setBrightness] = useState<number>(
    () => initialPrefs.brightness ?? 88,
  );
  const [tempUnit, setTempUnit] = useState<TempUnit>(() => initialPrefs.tempUnit ?? 'C');
  const [gestureNav, setGestureNav] = useState<boolean>(
    () => initialPrefs.gestureNav ?? true,
  );
  const [backSensitivity, setBackSensitivity] = useState<BackSensitivity>(
    () => initialPrefs.backSensitivity ?? 'medium',
  );
  const [lockOnWake, setLockOnWake] = useState<boolean>(
    () => initialPrefs.lockOnWake ?? true,
  );
  const [hapticsOn, setHapticsOn] = useState<boolean>(
    () => initialPrefs.hapticsEnabled ?? true,
  );
  const [dndOn, setDndOn] = useState<boolean>(() => initialPrefs.dndOn ?? false);
  const [wifiOn, setWifiOn] = useState<boolean>(() => initialPrefs.wifiOn ?? true);
  const [bluetoothOn, setBluetoothOn] = useState<boolean>(
    () => initialPrefs.bluetoothOn ?? false,
  );
  const [batterySaverOn, setBatterySaverOn] = useState<boolean>(
    () => initialPrefs.batterySaverOn ?? false,
  );
  const [rotationLockOn, setRotationLockOn] = useState<boolean>(
    () => initialPrefs.rotationLockOn ?? false,
  );
  const [flashlightOn, setFlashlightOn] = useState<boolean>(false);
  const [screenTimeout, setScreenTimeout] = useState<ScreenTimeout>(
    () => initialPrefs.screenTimeout ?? '1m',
  );
  const [mediaVolume, setMediaVolume] = useState<number>(
    () => initialPrefs.mediaVolume ?? 65,
  );
  const [ringVolume, setRingVolume] = useState<number>(
    () => initialPrefs.ringVolume ?? 80,
  );
  const [deviceName, setDeviceName] = useState<string>(
    () => initialPrefs.deviceName ?? 'Pixel 8 Pro',
  );
  const [developerMode, setDeveloperMode] = useState<boolean>(
    () => initialPrefs.developerMode ?? false,
  );
  const [drawerFoldered, setDrawerFoldered] = useState<boolean>(
    () => initialPrefs.drawerFolderedDefault ?? false,
  );
  const [appOrder, setAppOrder] = useState<string[]>(
    () => initialPrefs.appOrder ?? baseApps.map((a) => a.id),
  );
  const [tileOrder, setTileOrder] = useState<QuickTileId[]>(() => {
    const saved = initialPrefs.tileOrder;
    if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_TILE_ORDER;
    const validSet = new Set<QuickTileId>(DEFAULT_TILE_ORDER);
    const seen = new Set<QuickTileId>();
    const next: QuickTileId[] = [];
    for (const id of saved) {
      if (validSet.has(id) && !seen.has(id)) {
        seen.add(id);
        next.push(id);
      }
    }
    for (const id of DEFAULT_TILE_ORDER) {
      if (!seen.has(id)) {
        seen.add(id);
        next.push(id);
      }
    }
    return next;
  });
  const [uninstalledIds, setUninstalledIds] = useState<string[]>(
    () => initialPrefs.uninstalledIds ?? [],
  );
  const [shortcutIds, setShortcutIds] = useState<string[]>(
    () => initialPrefs.shortcutIds ?? [],
  );

  const unlockTimerRef = useRef<number | null>(null);
  const [locked, setLocked] = useState<boolean>(() => initialPrefs.lockOnWake ?? true);
  const [sleeping, setSleeping] = useState<boolean>(false);
  const [wakeKey, setWakeKey] = useState<number>(0);
  const [justUnlocked, setJustUnlocked] = useState<boolean>(false);

  const [shadeOpen, setShadeOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [weatherIndex, setWeatherIndex] = useState(0);
  const [activeFolder, setActiveFolder] = useState<AppCategory | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuTarget | null>(null);
  const [appInfoTarget, setAppInfoTarget] = useState<AppDef | null>(null);
  const [airplane, setAirplane] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const [launchedApp, setLaunchedApp] = useState<AppDef | null>(null);
  const [launchOrigin, setLaunchOrigin] = useState<LaunchOrigin | null>(null);
  const [launchId, setLaunchId] = useState(0);
  const [launchVisible, setLaunchVisible] = useState(false);
  const [launchBlocked, setLaunchBlocked] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2600);
  }, []);

  useEffect(() => {
    setHapticsEnabled(hapticsOn);
  }, [hapticsOn]);

  useEffect(() => {
    const payload: StoredPrefs = {
      mode,
      themedIcons,
      wallpaperIndex,
      customWallpaperUrl,
      customWallpaperHue,
      brightness,
      tempUnit,
      gestureNav,
      backSensitivity,
      lockOnWake,
      hapticsEnabled: hapticsOn,
      dndOn,
      wifiOn,
      bluetoothOn,
      batterySaverOn,
      rotationLockOn,
      screenTimeout,
      mediaVolume,
      ringVolume,
      deviceName,
      developerMode,
      drawerFolderedDefault: drawerFoldered,
      appOrder,
      tileOrder,
      uninstalledIds,
      shortcutIds,
    };
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(payload));
    } catch {
      try {
        window.localStorage.setItem(
          PREFS_KEY,
          JSON.stringify({ ...payload, customWallpaperUrl: null }),
        );
      } catch {
        /* ignore storage quota failures */
      }
    }
  }, [
    mode,
    themedIcons,
    wallpaperIndex,
    customWallpaperUrl,
    customWallpaperHue,
    brightness,
    tempUnit,
    gestureNav,
    backSensitivity,
    lockOnWake,
    hapticsOn,
    dndOn,
    wifiOn,
    bluetoothOn,
    batterySaverOn,
    rotationLockOn,
    screenTimeout,
    mediaVolume,
    ringVolume,
    deviceName,
    developerMode,
    drawerFoldered,
    appOrder,
    tileOrder,
    uninstalledIds,
    shortcutIds,
  ]);

  const orderedApps = useMemo(() => {
    const byId = new Map(baseApps.map((app) => [app.id, app]));
    const ordered: AppDef[] = [];
    for (const id of appOrder) {
      const found = byId.get(id);
      if (found && !uninstalledIds.includes(id)) {
        ordered.push(found);
        byId.delete(id);
      }
    }
    for (const [id, app] of byId.entries()) {
      if (!uninstalledIds.includes(id)) {
        ordered.push(app);
      }
    }
    return ordered;
  }, [appOrder, uninstalledIds]);

  const dockApps = useMemo(
    () => orderedApps.filter((app) => app.dock === true),
    [orderedApps],
  );

  const pinnedHomeApps = useMemo(() => {
    const baseHome = orderedApps.filter((app) => app.home === true);
    const customShortcuts = shortcutIds
      .map((id) => orderedApps.find((app) => app.id === id))
      .filter((app): app is AppDef => app !== undefined && !app.home)
      .map((app) => ({ ...app, isShortcut: true }));
    return [...baseHome, ...customShortcuts];
  }, [orderedApps, shortcutIds]);

  const weather = useMemo(() => getWeatherSnapshot(weatherIndex), [weatherIndex]);

  useEffect(() => {
    if (customWallpaperUrl) {
      if (wallpaperRef.current) {
        wallpaperRef.current.style.backgroundImage = `url("${customWallpaperUrl}")`;
      }
      applyTheme(customWallpaperHue ?? 220, mode);
      return;
    }
    const normalized =
      ((wallpaperIndex % wallpapers.length) + wallpapers.length) % wallpapers.length;
    const pack = wallpapers[normalized];
    if (wallpaperRef.current) {
      wallpaperRef.current.style.backgroundImage = pack.css;
    }
    applyTheme(pack.hue, mode);
  }, [wallpaperIndex, customWallpaperUrl, customWallpaperHue, mode]);

  useEffect(() => {
    const min = 20;
    const max = 100;
    const ratio = (brightness - min) / (max - min);
    document.documentElement.style.setProperty('--dim', ((1 - ratio) * 0.5).toFixed(3));
  }, [brightness]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      if (launchTimerRef.current !== null) window.clearTimeout(launchTimerRef.current);
      if (buildTapResetRef.current !== null) window.clearTimeout(buildTapResetRef.current);
      if (unlockTimerRef.current !== null) window.clearTimeout(unlockTimerRef.current);
    };
  }, []);

  const dragShade = useCallback(
    (offset: number | null) => {
      const wrapper = shadeWrapperRef.current;
      const screen = screenRef.current;
      if (!wrapper) return;
      if (offset === null) {
        wrapper.classList.remove('dragging');
        wrapper.style.transform = '';
        screen?.style.removeProperty('--shade-p');
        return;
      }
      const height = screen?.clientHeight ?? 800;
      const ratio = shadeOpen
        ? Math.max(0, Math.min(1, 1 + Math.min(0, offset) / height))
        : Math.max(0, Math.min(1, Math.max(0, offset) / height));
      screen?.style.setProperty('--shade-p', ratio.toFixed(3));
      wrapper.classList.add('dragging');
      wrapper.style.transform = shadeOpen
        ? `translate3d(0, ${Math.min(0, offset).toFixed(1)}px, 0)`
        : `translate3d(0, calc(-100% + ${Math.max(0, offset).toFixed(1)}px), 0)`;
    },
    [shadeOpen],
  );

  const dragDrawer = useCallback(
    (offset: number | null) => {
      const wrapper = drawerWrapperRef.current;
      const screen = screenRef.current;
      if (!wrapper) return;
      if (offset === null) {
        wrapper.classList.remove('dragging');
        wrapper.style.transform = '';
        wrapper.style.opacity = '';
        wrapper.style.borderRadius = '';
        screen?.style.removeProperty('--drawer-p');
        return;
      }
      const height = screen?.clientHeight ?? 800;
      const clampedRatio = drawerOpen
        ? Math.max(0, Math.min(1, 1 - Math.max(0, offset) / height))
        : Math.max(0, Math.min(1, Math.abs(Math.min(0, offset)) / height));
      const tiltDeg = ((1 - clampedRatio) * -6).toFixed(2);
      const scale = (0.95 + clampedRatio * 0.05).toFixed(3);
      const radius = Math.round((1 - clampedRatio) * 34);

      screen?.style.setProperty('--drawer-p', clampedRatio.toFixed(3));
      wrapper.classList.add('dragging');
      wrapper.style.opacity = (0.2 + clampedRatio * 0.8).toFixed(3);
      wrapper.style.borderRadius = `${radius}px ${radius}px 0 0`;
      wrapper.style.transform = drawerOpen
        ? `perspective(1100px) translate3d(0, ${Math.max(0, offset).toFixed(1)}px, 0) rotateX(${tiltDeg}deg) scale(${scale})`
        : `perspective(1100px) translate3d(0, calc(100% + ${Math.min(0, offset).toFixed(1)}px), 0) rotateX(${tiltDeg}deg) scale(${scale})`;
    },
    [drawerOpen],
  );

  const clearTransientOverlays = useCallback(() => {
    dragShade(null);
    dragDrawer(null);
    setContextMenu(null);
    setAppInfoTarget(null);
    setWeatherOpen(false);
    setActiveFolder(null);
    setSettingsOpen(false);
    setShadeOpen(false);
    setDrawerOpen(false);
    setLaunchVisible(false);
  }, [dragShade, dragDrawer]);

  const lockDevice = useCallback(() => {
    clearTransientOverlays();
    setJustUnlocked(false);
    setSleeping(false);
    setLocked(true);
    setWakeKey((k) => k + 1);
  }, [clearTransientOverlays]);

  const unlockDevice = useCallback(() => {
    setLocked(false);
    setJustUnlocked(true);
    screenRef.current?.style.removeProperty('--unlock-p');
    if (unlockTimerRef.current !== null) window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = window.setTimeout(() => setJustUnlocked(false), 540);
  }, []);

  const handleLockDragProgress = useCallback((progress: number | null) => {
    const screen = screenRef.current;
    if (!screen) return;
    if (progress === null) {
      screen.style.removeProperty('--unlock-p');
    } else {
      screen.style.setProperty('--unlock-p', progress.toFixed(3));
    }
  }, []);

  const handleEdgeBackProgress = useCallback((progress: number | null) => {
    const screen = screenRef.current;
    if (!screen) return;
    if (progress === null) {
      screen.style.removeProperty('--edge-back-p');
    } else {
      screen.style.setProperty('--edge-back-p', progress.toFixed(3));
    }
  }, []);

  const sleepDevice = useCallback(() => {
    clearTransientOverlays();
    setJustUnlocked(false);
    setSleeping(true);
    setLocked(lockOnWake);
  }, [clearTransientOverlays, lockOnWake]);

  const wakeDevice = useCallback(() => {
    triggerHaptic('tick');
    setSleeping(false);
    setLocked((prev) => prev || lockOnWake);
    setWakeKey((k) => k + 1);
  }, [lockOnWake]);

  const handlePowerButton = useCallback(() => {
    triggerHaptic('tap');
    if (sleeping) {
      wakeDevice();
    } else {
      sleepDevice();
    }
  }, [sleeping, wakeDevice, sleepDevice]);

  useEffect(() => {
    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();
        return;
      }
      if (document.visibilityState === 'visible') {
        const awayMs = hiddenAtRef.current !== null ? Date.now() - hiddenAtRef.current : 0;
        hiddenAtRef.current = null;
        if (lockOnWake && awayMs > 2000) {
          lockDevice();
        } else if (sleeping) {
          wakeDevice();
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [lockOnWake, sleeping, lockDevice, wakeDevice]);

  useEffect(() => {
    if (sleeping) return;
    const timeoutMs = SCREEN_TIMEOUT_MS[screenTimeout];
    let timer = window.setTimeout(sleepDevice, timeoutMs);

    const resetTimer = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(sleepDevice, timeoutMs);
    };

    window.addEventListener('pointerdown', resetTimer, { passive: true });
    window.addEventListener('keydown', resetTimer);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [sleeping, screenTimeout, sleepDevice]);

  const openShade = useCallback(() => {
    if (locked || sleeping) return;
    dragShade(null);
    setContextMenu(null);
    setActiveFolder(null);
    setWeatherOpen(false);
    setDrawerOpen(false);
    setShadeOpen(true);
  }, [locked, sleeping, dragShade]);

  const closeShade = useCallback(() => {
    dragShade(null);
    setShadeOpen(false);
  }, [dragShade]);

  const openDrawer = useCallback(() => {
    if (locked || sleeping) return;
    dragDrawer(null);
    setContextMenu(null);
    setActiveFolder(null);
    setWeatherOpen(false);
    setShadeOpen(false);
    setDrawerOpen(true);
  }, [locked, sleeping, dragDrawer]);

  const closeDrawer = useCallback(() => {
    dragDrawer(null);
    setDrawerOpen(false);
  }, [dragDrawer]);

  const openSettings = useCallback(() => {
    triggerHaptic('transition');
    setShadeOpen(false);
    setDrawerOpen(false);
    setActiveFolder(null);
    setWeatherOpen(false);
    setContextMenu(null);
    setSettingsOpen(true);
  }, []);

  const goHome = useCallback(() => {
    if (
      shadeOpen ||
      drawerOpen ||
      settingsOpen ||
      weatherOpen ||
      activeFolder !== null ||
      appInfoTarget !== null ||
      contextMenu !== null
    ) {
      triggerHaptic('transition');
    }
    clearTransientOverlays();
  }, [
    shadeOpen,
    drawerOpen,
    settingsOpen,
    weatherOpen,
    activeFolder,
    appInfoTarget,
    contextMenu,
    clearTransientOverlays,
  ]);

  const goBack = useCallback(() => {
    if (locked || sleeping) return;
    if (contextMenu) {
      triggerHaptic('tick');
      setContextMenu(null);
    } else if (appInfoTarget) {
      triggerHaptic('tick');
      setAppInfoTarget(null);
    } else if (weatherOpen) {
      triggerHaptic('tick');
      setWeatherOpen(false);
    } else if (activeFolder) {
      triggerHaptic('tick');
      setActiveFolder(null);
    } else if (settingsOpen) {
      triggerHaptic('tick');
      setSettingsOpen(false);
    } else if (shadeOpen) {
      triggerHaptic('tick');
      closeShade();
    } else if (drawerOpen) {
      triggerHaptic('tick');
      closeDrawer();
    }
  }, [
    locked,
    sleeping,
    contextMenu,
    appInfoTarget,
    weatherOpen,
    activeFolder,
    settingsOpen,
    shadeOpen,
    drawerOpen,
    closeShade,
    closeDrawer,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !locked && !sleeping) goHome();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goHome, locked, sleeping]);

  const handleWallpaperChange = useCallback(
    (index: number) => {
      const normalized = ((index % wallpapers.length) + wallpapers.length) % wallpapers.length;
      setCustomWallpaperUrl(null);
      setCustomWallpaperHue(null);
      setWallpaperIndex(normalized);
      const pack = wallpapers[normalized];
      showToast(`${pack.name} wallpaper`);
    },
    [showToast],
  );

  const handleCustomWallpaperSelect = useCallback(
    async (file: File) => {
      try {
        const result = await processCustomWallpaperFile(file);
        setCustomWallpaperUrl(result.dataUrl);
        setCustomWallpaperHue(result.hue);
        triggerHaptic('success');
        showToast('Custom wallpaper applied');
      } catch {
        showToast('Could not load selected image');
      }
    },
    [showToast],
  );

  const handleClearCustomWallpaper = useCallback(() => {
    setCustomWallpaperUrl(null);
    setCustomWallpaperHue(null);
    const pack = wallpapers[wallpaperIndex] ?? wallpapers[0];
    showToast(`${pack.name} wallpaper restored`);
  }, [wallpaperIndex, showToast]);

  const handleBuildNumberTap = useCallback(() => {
    if (developerMode) {
      showToast('Already in developer mode');
      return;
    }
    buildTapCountRef.current += 1;
    if (buildTapResetRef.current !== null) {
      window.clearTimeout(buildTapResetRef.current);
    }
    buildTapResetRef.current = window.setTimeout(() => {
      buildTapCountRef.current = 0;
    }, 2200);

    const remaining = 7 - buildTapCountRef.current;
    if (remaining <= 0) {
      buildTapCountRef.current = 0;
      setDeveloperMode(true);
      triggerHaptic('success');
      showToast('Developer mode enabled');
    } else if (remaining <= 4) {
      showToast(`${remaining} step${remaining === 1 ? '' : 's'} to developer mode`);
    }
  }, [developerMode, showToast]);

  const handleCreateShortcut = useCallback(
    (app: AppDef) => {
      if (app.home || shortcutIds.includes(app.id)) {
        showToast(`${app.name} is already on Home`);
        return;
      }
      setShortcutIds((prev) => [...prev, app.id]);
      showToast(`Added ${app.name} shortcut`);
    },
    [shortcutIds, showToast],
  );

  const handleUninstall = useCallback(
    (app: AppDef) => {
      if (app.isShortcut && !app.home) {
        setShortcutIds((prev) => prev.filter((id) => id !== app.id));
        showToast(`Removed ${app.name} shortcut`);
        return;
      }
      if (app.systemApp) {
        showToast(`${app.name} is a system app`);
        return;
      }
      setUninstalledIds((prev) => (prev.includes(app.id) ? prev : [...prev, app.id]));
      setShortcutIds((prev) => prev.filter((id) => id !== app.id));
      showToast(`${app.name} uninstalled`);
    },
    [showToast],
  );

  const handleReorderApps = useCallback((sourceId: string, targetId: string) => {
    setAppOrder((prev) => {
      const list = prev.length > 0 ? [...prev] : baseApps.map((a) => a.id);
      const fromIndex = list.indexOf(sourceId);
      const toIndex = list.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return list;
    });
  }, []);

  const handleReorderTiles = useCallback((sourceId: QuickTileId, targetId: QuickTileId) => {
    setTileOrder((prev) => {
      const list = prev.length > 0 ? [...prev] : [...DEFAULT_TILE_ORDER];
      const fromIndex = list.indexOf(sourceId);
      const toIndex = list.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return list;
    });
  }, []);

  const handleResetTileOrder = useCallback(() => {
    setTileOrder(DEFAULT_TILE_ORDER);
  }, []);

  const launch = useCallback(
    (app: AppDef, sourceRect?: DOMRect) => {
      if (app.action === 'settings') {
        openSettings();
        return;
      }
      if (app.action === 'weather') {
        triggerHaptic('transition');
        setShadeOpen(false);
        setDrawerOpen(false);
        setActiveFolder(null);
        setWeatherOpen(true);
        return;
      }

      let origin: LaunchOrigin | null = null;
      const screenRect = screenRef.current?.getBoundingClientRect();
      if (sourceRect && screenRect && sourceRect.width > 0) {
        origin = {
          x: sourceRect.left - screenRect.left + sourceRect.width / 2,
          y: sourceRect.top - screenRect.top + sourceRect.height / 2,
          radius: Math.round(Math.min(sourceRect.width, sourceRect.height) / 2),
        };
      }

      setShadeOpen(false);
      setDrawerOpen(false);
      setActiveFolder(null);
      setLaunchedApp(app);
      setLaunchOrigin(origin);
      setLaunchId((id) => id + 1);
      setLaunchVisible(true);

      let opened = false;
      try {
        const link = document.createElement('a');
        link.href = app.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
        opened = true;
      } catch {
        opened = false;
      }

      setLaunchBlocked(!opened);

      if (launchTimerRef.current !== null) {
        window.clearTimeout(launchTimerRef.current);
      }
      launchTimerRef.current = window.setTimeout(() => {
        setLaunchVisible(false);
      }, opened ? 950 : 4000);
    },
    [openSettings],
  );

  const handleOpenCameraFromLock = useCallback(
    (originRect?: DOMRect) => {
      const cam = orderedApps.find((app) => app.id === 'camera');
      unlockDevice();
      if (cam) launch(cam, originRect);
    },
    [orderedApps, unlockDevice, launch],
  );

  useDragY(screenRef, {
    zone: (event) => {
      const target = event.target as HTMLElement;
      return (
        !locked &&
        !sleeping &&
        !shadeOpen &&
        !drawerOpen &&
        !settingsOpen &&
        !weatherOpen &&
        activeFolder === null &&
        contextMenu === null &&
        appInfoTarget === null &&
        target.closest('button, a, input, .statusbar, .edge-zone') === null
      );
    },
    move: (delta) => {
      if (delta < 0) dragDrawer(delta);
    },
    end: (delta, velocity) => {
      dragDrawer(null);
      if (delta < -60 || velocity < -0.45) {
        triggerHaptic('transition');
        openDrawer();
      }
    },
  });

  const hasOverlay =
    shadeOpen ||
    drawerOpen ||
    settingsOpen ||
    weatherOpen ||
    activeFolder !== null ||
    appInfoTarget !== null ||
    contextMenu !== null;

  const activeFolderApps = useMemo(() => {
    if (!activeFolder) return [];
    return orderedApps.filter(
      (app) => !app.isShortcut && app.category === activeFolder,
    );
  }, [activeFolder, orderedApps]);

  return (
    <main className="device">
      <div className="device-earpiece" aria-hidden="true" />
      <button
        type="button"
        className="device-power-btn"
        aria-label={sleeping ? 'Wake device' : 'Sleep / Lock device'}
        title={sleeping ? 'Wake device' : 'Power / Lock screen'}
        onClick={handlePowerButton}
      />
      <div className="device-volume-btn" aria-hidden="true" />
      <div
        ref={screenRef}
        id="screen"
        className={`screen${themedIcons ? ' themed-icons' : ''}${hasOverlay ? ' has-overlay' : ''}${drawerOpen ? ' drawer-active' : ''}${
          flashlightOn ? ' flashlight-on' : ''
        }${locked && !sleeping ? ' is-locked' : ''}${justUnlocked ? ' just-unlocked' : ''}`}
        onContextMenu={(event) => {
          const target = event.target as HTMLElement;
          if (!target.closest('input, textarea')) {
            event.preventDefault();
          }
        }}
      >
        <div ref={wallpaperRef} id="wallpaper" className="wallpaper" />

        <HomeScreen
          compactDate={clock.compactDate}
          hours={clock.hours}
          minutes={clock.minutes}
          seconds={clock.seconds}
          weather={weather}
          tempUnit={tempUnit}
          allApps={orderedApps}
          pinnedHomeApps={pinnedHomeApps}
          dockApps={dockApps}
          onOpenWeather={() => {
            triggerHaptic('transition');
            setWeatherOpen(true);
          }}
          onOpenFolder={(category) => setActiveFolder(category)}
          onLaunch={launch}
          onLongPressApp={(app, rect) => setContextMenu({ app, rect })}
          onOpenDrawer={openDrawer}
        />

        <StatusBar
          time={clock.time}
          airplane={airplane}
          wifiOn={wifiOn}
          bluetoothOn={bluetoothOn}
          batterySaverOn={batterySaverOn}
          dndOn={dndOn}
          drawerOpen={drawerOpen || settingsOpen}
          locked={locked || sleeping}
          onOpenShade={openShade}
          onDragShade={dragShade}
        />

        <AppDrawer
          wrapperRef={drawerWrapperRef}
          open={drawerOpen}
          apps={orderedApps}
          time={clock.time}
          longDate={clock.longDate}
          folderedView={drawerFoldered}
          onToggleFolderedView={() => setDrawerFoldered((prev) => !prev)}
          onOpenFolder={(category) => setActiveFolder(category)}
          onLaunch={launch}
          onLongPressApp={(app, rect) => setContextMenu({ app, rect })}
          onReorderApps={handleReorderApps}
          onClose={closeDrawer}
          onDrag={dragDrawer}
        />

        <QuickShade
          wrapperRef={shadeWrapperRef}
          open={shadeOpen}
          time={clock.time}
          longDate={clock.longDate}
          mode={mode}
          brightness={brightness}
          wifiOn={wifiOn}
          bluetoothOn={bluetoothOn}
          dndOn={dndOn}
          flashlightOn={flashlightOn}
          airplane={airplane}
          batterySaverOn={batterySaverOn}
          rotationLockOn={rotationLockOn}
          tileOrder={tileOrder}
          onClose={closeShade}
          onDrag={dragShade}
          onModeChange={setMode}
          onBrightnessChange={setBrightness}
          onWifiChange={setWifiOn}
          onBluetoothChange={setBluetoothOn}
          onDndChange={setDndOn}
          onFlashlightChange={setFlashlightOn}
          onAirplaneChange={setAirplane}
          onBatterySaverChange={setBatterySaverOn}
          onRotationLockChange={setRotationLockOn}
          onReorderTiles={handleReorderTiles}
          onResetTileOrder={handleResetTileOrder}
          onLockScreen={lockDevice}
          onOpenSettings={openSettings}
        />

        <FolderOverlay
          category={activeFolder}
          apps={activeFolderApps}
          onClose={() => setActiveFolder(null)}
          onLaunch={launch}
          onLongPress={(app, rect) => setContextMenu({ app, rect })}
        />

        <WeatherOverlay
          open={weatherOpen}
          weather={weather}
          unit={tempUnit}
          onClose={() => setWeatherOpen(false)}
          onRefresh={() => setWeatherIndex((prev) => getNextWeatherIndex(prev))}
          onToggleUnit={() => setTempUnit((prev) => (prev === 'C' ? 'F' : 'C'))}
        />

        <SettingsView
          open={settingsOpen}
          mode={mode}
          themedIcons={themedIcons}
          wallpapers={wallpapers}
          wallpaperIndex={wallpaperIndex}
          customWallpaperUrl={customWallpaperUrl}
          customWallpaperHue={customWallpaperHue}
          brightness={brightness}
          tempUnit={tempUnit}
          gestureNav={gestureNav}
          backSensitivity={backSensitivity}
          lockOnWake={lockOnWake}
          hapticsEnabled={hapticsOn}
          dndOn={dndOn}
          wifiOn={wifiOn}
          bluetoothOn={bluetoothOn}
          airplane={airplane}
          batterySaverOn={batterySaverOn}
          rotationLockOn={rotationLockOn}
          screenTimeout={screenTimeout}
          mediaVolume={mediaVolume}
          ringVolume={ringVolume}
          deviceName={deviceName}
          developerMode={developerMode}
          drawerFolderedDefault={drawerFoldered}
          uninstalledCount={uninstalledIds.length}
          installedAppsCount={orderedApps.length}
          onClose={() => {
            triggerHaptic('tick');
            setSettingsOpen(false);
          }}
          onModeChange={setMode}
          onThemedIconsChange={setThemedIcons}
          onWallpaperChange={handleWallpaperChange}
          onCustomWallpaperSelect={handleCustomWallpaperSelect}
          onClearCustomWallpaper={handleClearCustomWallpaper}
          onBrightnessChange={setBrightness}
          onTempUnitChange={setTempUnit}
          onGestureNavChange={setGestureNav}
          onBackSensitivityChange={setBackSensitivity}
          onLockOnWakeChange={setLockOnWake}
          onLockNow={lockDevice}
          onHapticsChange={setHapticsOn}
          onDndChange={setDndOn}
          onWifiChange={setWifiOn}
          onBluetoothChange={setBluetoothOn}
          onAirplaneChange={setAirplane}
          onBatterySaverChange={setBatterySaverOn}
          onRotationLockChange={setRotationLockOn}
          onScreenTimeoutChange={setScreenTimeout}
          onMediaVolumeChange={setMediaVolume}
          onRingVolumeChange={setRingVolume}
          onDeviceNameChange={setDeviceName}
          onBuildNumberTap={handleBuildNumberTap}
          onDrawerFolderedDefaultChange={setDrawerFoldered}
          onResetAppOrder={() => {
            setAppOrder(baseApps.map((a) => a.id));
            showToast('App drawer grid reset');
          }}
          onRestoreUninstalled={() => {
            setUninstalledIds([]);
            showToast('Uninstalled apps restored');
          }}
        />

        <AppInfoModal
          app={appInfoTarget}
          onClose={() => setAppInfoTarget(null)}
          onOpenApp={launch}
          onCreateShortcut={handleCreateShortcut}
          onUninstall={handleUninstall}
        />

        <AppContextMenu
          target={contextMenu}
          screenRect={screenRef.current?.getBoundingClientRect() ?? null}
          onClose={() => setContextMenu(null)}
          onAppInfo={(app) => setAppInfoTarget(app)}
          onCreateShortcut={handleCreateShortcut}
          onUninstall={handleUninstall}
        />

        <EdgeBackGesture
          screenRef={screenRef}
          enabled={gestureNav && !locked && !sleeping}
          canGoBack={hasOverlay}
          sensitivity={backSensitivity}
          onProgress={handleEdgeBackProgress}
          onBack={goBack}
        />

        <LockScreen
          open={locked && !sleeping}
          wakeKey={wakeKey}
          time={clock.time}
          compactDate={clock.compactDate}
          longDate={clock.longDate}
          hours={clock.hours}
          minutes={clock.minutes}
          seconds={clock.seconds}
          weather={weather}
          tempUnit={tempUnit}
          flashlightOn={flashlightOn}
          onToggleFlashlight={() => setFlashlightOn((prev) => !prev)}
          onOpenCamera={handleOpenCameraFromLock}
          onUnlockProgress={handleLockDragProgress}
          onUnlock={unlockDevice}
        />

        {sleeping && (
          <button
            type="button"
            className="sleep-screen"
            aria-label="Wake screen"
            onClick={wakeDevice}
          >
            <div className="aod-clock-group">
              <span className="aod-time">{clock.time}</span>
              <span className="aod-date">{clock.longDate}</span>
            </div>
            <span className="aod-fp-hint" aria-hidden="true">
              <Glyph name="fingerprint" size={30} />
            </span>
          </button>
        )}

        <div className="flashlight-glow" aria-hidden="true" />
        <div className="dim" aria-hidden="true" />
        <div className="punch-hole" aria-hidden="true" />

        {!locked && !sleeping && (
          <NavBar
            gestureNav={gestureNav}
            hasOverlay={hasOverlay}
            onBack={goBack}
            onHome={goHome}
            onOpenDrawer={openDrawer}
          />
        )}

        <LaunchOverlay
          app={launchedApp}
          visible={launchVisible}
          blocked={launchBlocked}
          origin={launchOrigin}
          launchKey={launchId}
          onDismiss={() => setLaunchVisible(false)}
        />

        <div
          className={`toast${toastVisible ? ' show' : ''}`}
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      </div>
    </main>
  );
}
