import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { triggerDetentHaptic, triggerHaptic } from '../utils/haptics';
import type { ThemeMode } from '../utils/theme';
import type { WallpaperPack } from '../utils/wallpaper';
import type { TempUnit } from '../utils/weather';
import type { BackSensitivity } from './EdgeBackGesture';
import { Glyph } from './Glyph';
import { PWAInstallButton } from './PWAInstallButton';

export type ScreenTimeout = '30s' | '1m' | '2m' | '5m';

export interface SettingsViewProps {
  open: boolean;
  mode: ThemeMode;
  themedIcons: boolean;
  wallpapers: WallpaperPack[];
  wallpaperIndex: number;
  customWallpaperUrl: string | null;
  customWallpaperHue: number | null;
  brightness: number;
  tempUnit: TempUnit;
  gestureNav: boolean;
  backSensitivity: BackSensitivity;
  lockOnWake: boolean;
  hapticsEnabled: boolean;
  dndOn: boolean;
  wifiOn: boolean;
  bluetoothOn: boolean;
  airplane: boolean;
  batterySaverOn: boolean;
  rotationLockOn: boolean;
  screenTimeout: ScreenTimeout;
  mediaVolume: number;
  ringVolume: number;
  deviceName: string;
  developerMode: boolean;
  drawerFolderedDefault: boolean;
  uninstalledCount: number;
  installedAppsCount: number;
  onClose: () => void;
  onModeChange: (mode: ThemeMode) => void;
  onThemedIconsChange: (enabled: boolean) => void;
  onWallpaperChange: (index: number) => void;
  onCustomWallpaperSelect: (file: File) => void;
  onClearCustomWallpaper: () => void;
  onBrightnessChange: (value: number) => void;
  onTempUnitChange: (unit: TempUnit) => void;
  onGestureNavChange: (enabled: boolean) => void;
  onBackSensitivityChange: (sensitivity: BackSensitivity) => void;
  onLockOnWakeChange: (enabled: boolean) => void;
  onLockNow: () => void;
  onHapticsChange: (enabled: boolean) => void;
  onDndChange: (enabled: boolean) => void;
  onWifiChange: (enabled: boolean) => void;
  onBluetoothChange: (enabled: boolean) => void;
  onAirplaneChange: (enabled: boolean) => void;
  onBatterySaverChange: (enabled: boolean) => void;
  onRotationLockChange: (enabled: boolean) => void;
  onScreenTimeoutChange: (timeout: ScreenTimeout) => void;
  onMediaVolumeChange: (value: number) => void;
  onRingVolumeChange: (value: number) => void;
  onDeviceNameChange: (name: string) => void;
  onBuildNumberTap: () => void;
  onDrawerFolderedDefaultChange: (foldered: boolean) => void;
  onResetAppOrder: () => void;
  onRestoreUninstalled: () => void;
}

const TIMEOUT_OPTIONS: ScreenTimeout[] = ['30s', '1m', '2m', '5m'];
const SENSITIVITY_OPTIONS: { id: BackSensitivity; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Med' },
  { id: 'high', label: 'High' },
];

export function SettingsView({
  open,
  mode,
  themedIcons,
  wallpapers,
  wallpaperIndex,
  customWallpaperUrl,
  customWallpaperHue,
  brightness,
  tempUnit,
  gestureNav,
  backSensitivity,
  lockOnWake,
  hapticsEnabled,
  dndOn,
  wifiOn,
  bluetoothOn,
  airplane,
  batterySaverOn,
  rotationLockOn,
  screenTimeout,
  mediaVolume,
  ringVolume,
  deviceName,
  developerMode,
  drawerFolderedDefault,
  uninstalledCount,
  installedAppsCount,
  onClose,
  onModeChange,
  onThemedIconsChange,
  onWallpaperChange,
  onCustomWallpaperSelect,
  onClearCustomWallpaper,
  onBrightnessChange,
  onTempUnitChange,
  onGestureNavChange,
  onBackSensitivityChange,
  onLockOnWakeChange,
  onLockNow,
  onHapticsChange,
  onDndChange,
  onWifiChange,
  onBluetoothChange,
  onAirplaneChange,
  onBatterySaverChange,
  onRotationLockChange,
  onScreenTimeoutChange,
  onMediaVolumeChange,
  onRingVolumeChange,
  onDeviceNameChange,
  onBuildNumberTap,
  onDrawerFolderedDefaultChange,
  onResetAppOrder,
  onRestoreUninstalled,
}: SettingsViewProps) {
  const swatchRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    for (const pack of wallpapers) {
      swatchRefs.current[pack.id]?.style.setProperty('--swatch', pack.swatch);
    }
    const preview = previewRef.current;
    if (!preview) return;
    if (customWallpaperUrl) {
      preview.style.backgroundImage = `url("${customWallpaperUrl}")`;
    } else {
      const active = wallpapers[wallpaperIndex];
      if (active) preview.style.backgroundImage = active.css;
    }
  }, [wallpapers, wallpaperIndex, customWallpaperUrl, open]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const normalizedQuery = query.trim().toLowerCase();

  const matches = useMemo(() => {
    const has = (text: string) =>
      normalizedQuery === '' || text.toLowerCase().includes(normalizedQuery);
    return {
      pwa: has('install pwa web app home screen'),
      wallpaper: has('wallpaper style image photo theme dark palette color themed icons material you accent'),
      network: has('network internet wifi wi-fi airplane mobile 5g'),
      devices: has('connected devices bluetooth earbuds pixel watch'),
      apps: has('apps launcher foldered grid order reset restore uninstalled'),
      notifications: has('notifications do not disturb dnd'),
      battery: has('battery saver usage'),
      display: has('display brightness rotation lock screen timeout weather celsius fahrenheit'),
      sound: has('sound vibration haptics media volume ring'),
      gestures: has('system gestures navigation back sensitivity lockscreen wake lock fingerprint security'),
      about: has('about phone device name webdroid tensor ram storage android version security patch kernel ip build number developer'),
    };
  }, [normalizedQuery]);

  const hasAnyMatch = Object.values(matches).some(Boolean);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) {
      onCustomWallpaperSelect(file);
    }
  }

  return (
    <div
      className={`sheet-overlay${open ? ' open' : ''}`}
      aria-hidden={!open}
      role="dialog"
      aria-label="Settings"
    >
      <div className="sheet-panel">
        <header className="sheet-header">
          <button
            type="button"
            className="sheet-back"
            aria-label="Back"
            onClick={() => {
              triggerHaptic('tick');
              onClose();
            }}
          >
            <Glyph name="arrow_back" size={20} />
          </button>
          <div className="sheet-title-wrap">
            <h2 className="sheet-title">Settings</h2>
            <span className="sheet-subtitle">{deviceName || 'Pixel 8 Pro'}</span>
          </div>
        </header>

        <div className="settings-search">
          <Glyph name="search" size={18} />
          <input
            type="search"
            value={query}
            placeholder="Search settings"
            aria-label="Search settings"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
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
        </div>

        <div className="sheet-content">
          {!hasAnyMatch && <p className="drawer-empty">No matching settings</p>}

          {matches.pwa && <PWAInstallButton />}

          {matches.wallpaper && (
            <section className="settings-section">
              <h3 className="settings-heading">Wallpaper &amp; style</h3>
              <div className="settings-card">
                <div className="wallpaper-preview-row">
                  <div ref={previewRef} className="wallpaper-mini-frame" aria-hidden="true">
                    <span className="wallpaper-mini-clock">✿</span>
                  </div>
                  <div className="wallpaper-preview-meta">
                    <div className="settings-row-title">
                      {customWallpaperUrl
                        ? `Custom · ${customWallpaperHue ?? 220}°`
                        : wallpapers[wallpaperIndex]?.name ?? 'Aurora'}
                    </div>
                    <div className="swatches settings-swatches">
                      {wallpapers.map((pack, index) => (
                        <button
                          key={pack.id}
                          ref={(node) => {
                            swatchRefs.current[pack.id] = node;
                          }}
                          type="button"
                          className={`swatch${!customWallpaperUrl && index === wallpaperIndex ? ' active' : ''}`}
                          title={pack.name}
                          aria-label={`${pack.name} wallpaper`}
                          onClick={() => {
                            triggerHaptic('tap');
                            onWallpaperChange(index);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="wallpaper-upload-actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="md3-tonal-btn primary"
                    onClick={() => {
                      triggerHaptic('tap');
                      fileInputRef.current?.click();
                    }}
                  >
                    <Glyph name="add_photo_alternate" size={16} />
                    <span>{customWallpaperUrl ? 'Change image' : 'Custom image'}</span>
                  </button>
                  {customWallpaperUrl && (
                    <button
                      type="button"
                      className="md3-tonal-btn"
                      onClick={() => {
                        triggerHaptic('tick');
                        onClearCustomWallpaper();
                      }}
                    >
                      <Glyph name="delete" size={16} />
                      <span>Use preset</span>
                    </button>
                  )}
                </div>

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={mode === 'dark'}
                  onClick={() => {
                    triggerHaptic('tap');
                    onModeChange(mode === 'dark' ? 'light' : 'dark');
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="dark_mode" size={18} filled={mode === 'dark'} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Dark theme</span>
                  </span>
                  <span className={`md3-switch${mode === 'dark' ? ' on' : ''}`} aria-hidden="true">
                    <span className="md3-switch-thumb" />
                  </span>
                </button>

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={themedIcons}
                  onClick={() => {
                    triggerHaptic('tap');
                    onThemedIconsChange(!themedIcons);
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="palette" size={18} filled={themedIcons} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Themed icons</span>
                    <span className="settings-row-sub">Match wallpaper accent color</span>
                  </span>
                  <span className={`md3-switch${themedIcons ? ' on' : ''}`} aria-hidden="true">
                    <span className="md3-switch-thumb" />
                  </span>
                </button>
              </div>
            </section>
          )}

          {matches.network && (
            <section className="settings-section">
              <h3 className="settings-heading">Network &amp; internet</h3>
              <div className="settings-card">
                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={wifiOn && !airplane}
                  onClick={() => {
                    triggerHaptic('tap');
                    const next = !(wifiOn && !airplane);
                    onWifiChange(next);
                    if (next && airplane) onAirplaneChange(false);
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="wifi" size={18} filled={wifiOn && !airplane} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Wi-Fi</span>
                    <span className="settings-row-sub">
                      {airplane ? 'Airplane mode' : wifiOn ? 'PixelNet_5G' : 'Off'}
                    </span>
                  </span>
                  <span
                    className={`md3-switch${wifiOn && !airplane ? ' on' : ''}`}
                    aria-hidden="true"
                  >
                    <span className="md3-switch-thumb" />
                  </span>
                </button>

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={airplane}
                  onClick={() => {
                    triggerHaptic('tap');
                    const next = !airplane;
                    onAirplaneChange(next);
                    if (next) {
                      onWifiChange(false);
                      onBluetoothChange(false);
                    } else {
                      onWifiChange(true);
                    }
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="airplanemode_active" size={18} filled={airplane} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Airplane mode</span>
                  </span>
                  <span className={`md3-switch${airplane ? ' on' : ''}`} aria-hidden="true">
                    <span className="md3-switch-thumb" />
                  </span>
                </button>

                <div className="settings-divider" />

                <div className="settings-row">
                  <span className="settings-row-label">SIMs</span>
                  <span className="settings-row-value">
                    {airplane ? 'No service' : 'Pixel Mobile 5G'}
                  </span>
                </div>
              </div>
            </section>
          )}

          {matches.devices && (
            <section className="settings-section">
              <h3 className="settings-heading">Connected devices</h3>
              <div className="settings-card">
                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={bluetoothOn && !airplane}
                  onClick={() => {
                    triggerHaptic('tap');
                    const next = !(bluetoothOn && !airplane);
                    onBluetoothChange(next);
                    if (next && airplane) onAirplaneChange(false);
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="bluetooth" size={18} filled={bluetoothOn && !airplane} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Bluetooth</span>
                    <span className="settings-row-sub">
                      {bluetoothOn && !airplane ? '2 devices connected' : 'Off'}
                    </span>
                  </span>
                  <span
                    className={`md3-switch${bluetoothOn && !airplane ? ' on' : ''}`}
                    aria-hidden="true"
                  >
                    <span className="md3-switch-thumb" />
                  </span>
                </button>

                {bluetoothOn && !airplane && (
                  <>
                    <div className="settings-divider" />
                    <div className="settings-row">
                      <span className="settings-row-label">Pixel Buds Pro</span>
                      <span className="settings-row-value tabular">90%</span>
                    </div>
                    <div className="settings-row">
                      <span className="settings-row-label">Pixel Watch 2</span>
                      <span className="settings-row-value tabular">76%</span>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {matches.apps && (
            <section className="settings-section">
              <h3 className="settings-heading">Apps</h3>
              <div className="settings-card">
                <div className="settings-row">
                  <span className="settings-row-label">Installed</span>
                  <span className="settings-row-value tabular">{installedAppsCount} apps</span>
                </div>

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={drawerFolderedDefault}
                  onClick={() => {
                    triggerHaptic('tap');
                    onDrawerFolderedDefaultChange(!drawerFolderedDefault);
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="folder" size={18} filled={drawerFolderedDefault} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Foldered app drawer</span>
                  </span>
                  <span
                    className={`md3-switch${drawerFolderedDefault ? ' on' : ''}`}
                    aria-hidden="true"
                  >
                    <span className="md3-switch-thumb" />
                  </span>
                </button>

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-action-row"
                  onClick={() => {
                    triggerHaptic('tap');
                    onResetAppOrder();
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="restart_alt" size={18} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Reset drawer order</span>
                  </span>
                </button>

                {uninstalledCount > 0 && (
                  <>
                    <div className="settings-divider" />
                    <button
                      type="button"
                      className="settings-action-row"
                      onClick={() => {
                        triggerHaptic('success');
                        onRestoreUninstalled();
                      }}
                    >
                      <span className="settings-row-icon">
                        <Glyph name="restore" size={18} />
                      </span>
                      <span className="settings-row-text">
                        <span className="settings-row-title">
                          Restore apps ({uninstalledCount})
                        </span>
                      </span>
                    </button>
                  </>
                )}
              </div>
            </section>
          )}

          {matches.notifications && (
            <section className="settings-section">
              <h3 className="settings-heading">Notifications</h3>
              <div className="settings-card">
                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={dndOn}
                  onClick={() => {
                    triggerHaptic('tap');
                    onDndChange(!dndOn);
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="do_not_disturb_on" size={18} filled={dndOn} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Do Not Disturb</span>
                  </span>
                  <span className={`md3-switch${dndOn ? ' on' : ''}`} aria-hidden="true">
                    <span className="md3-switch-thumb" />
                  </span>
                </button>
              </div>
            </section>
          )}

          {matches.battery && (
            <section className="settings-section">
              <h3 className="settings-heading">Battery</h3>
              <div className="settings-card">
                <div className="settings-battery-summary">
                  <div className="settings-battery-top">
                    <span className="settings-battery-pct">84%</span>
                    <span className="settings-row-sub">
                      {batterySaverOn ? '~26 hr left' : '~14 hr left'}
                    </span>
                  </div>
                  <div className="settings-battery-bar" aria-hidden="true">
                    <div className="settings-battery-fill" />
                  </div>
                </div>

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={batterySaverOn}
                  onClick={() => {
                    triggerHaptic('tap');
                    onBatterySaverChange(!batterySaverOn);
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="battery_saver" size={18} filled={batterySaverOn} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Battery Saver</span>
                  </span>
                  <span className={`md3-switch${batterySaverOn ? ' on' : ''}`} aria-hidden="true">
                    <span className="md3-switch-thumb" />
                  </span>
                </button>
              </div>
            </section>
          )}

          {matches.display && (
            <section className="settings-section">
              <h3 className="settings-heading">Display</h3>
              <div className="settings-card">
                <div className="settings-slider-row">
                  <div className="settings-slider-top">
                    <span className="settings-row-icon">
                      <Glyph name="brightness_6" size={18} />
                    </span>
                    <span className="settings-row-title">Brightness</span>
                    <span className="settings-row-value tabular">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    className="settings-range"
                    min={20}
                    max={100}
                    step={1}
                    value={brightness}
                    aria-label="Display brightness"
                    onChange={(event) => {
                      const val = Number(event.target.value);
                      triggerDetentHaptic('settings-brightness', val);
                      onBrightnessChange(val);
                    }}
                  />
                </div>

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={rotationLockOn}
                  onClick={() => {
                    triggerHaptic('tap');
                    onRotationLockChange(!rotationLockOn);
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="screen_lock_rotation" size={18} filled={rotationLockOn} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Rotation lock</span>
                  </span>
                  <span className={`md3-switch${rotationLockOn ? ' on' : ''}`} aria-hidden="true">
                    <span className="md3-switch-thumb" />
                  </span>
                </button>

                <div className="settings-divider" />

                <div className="settings-segment-row">
                  <span className="settings-row-icon">
                    <Glyph name="timer" size={18} />
                  </span>
                  <div className="settings-row-text">
                    <span className="settings-row-title">Timeout</span>
                  </div>
                  <div className="md3-segmented">
                    {TIMEOUT_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`md3-seg-btn${screenTimeout === option ? ' active' : ''}`}
                        onClick={() => {
                          triggerHaptic('tick');
                          onScreenTimeoutChange(option);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-divider" />

                <div className="settings-segment-row">
                  <span className="settings-row-icon">
                    <Glyph name="partly_cloudy_day" size={18} />
                  </span>
                  <div className="settings-row-text">
                    <span className="settings-row-title">Weather unit</span>
                  </div>
                  <div className="md3-segmented">
                    <button
                      type="button"
                      className={`md3-seg-btn${tempUnit === 'C' ? ' active' : ''}`}
                      onClick={() => {
                        triggerHaptic('tick');
                        onTempUnitChange('C');
                      }}
                    >
                      °C
                    </button>
                    <button
                      type="button"
                      className={`md3-seg-btn${tempUnit === 'F' ? ' active' : ''}`}
                      onClick={() => {
                        triggerHaptic('tick');
                        onTempUnitChange('F');
                      }}
                    >
                      °F
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {matches.sound && (
            <section className="settings-section">
              <h3 className="settings-heading">Sound &amp; vibration</h3>
              <div className="settings-card">
                <div className="settings-slider-row">
                  <div className="settings-slider-top">
                    <span className="settings-row-icon">
                      <Glyph name="music_note" size={18} />
                    </span>
                    <span className="settings-row-title">Media</span>
                    <span className="settings-row-value tabular">{mediaVolume}%</span>
                  </div>
                  <input
                    type="range"
                    className="settings-range"
                    min={0}
                    max={100}
                    step={1}
                    value={mediaVolume}
                    aria-label="Media volume"
                    onChange={(event) => {
                      const val = Number(event.target.value);
                      triggerDetentHaptic('settings-media', val);
                      onMediaVolumeChange(val);
                    }}
                  />
                </div>

                <div className="settings-divider" />

                <div className="settings-slider-row">
                  <div className="settings-slider-top">
                    <span className="settings-row-icon">
                      <Glyph name="notifications" size={18} />
                    </span>
                    <span className="settings-row-title">Ring &amp; notification</span>
                    <span className="settings-row-value tabular">{ringVolume}%</span>
                  </div>
                  <input
                    type="range"
                    className="settings-range"
                    min={0}
                    max={100}
                    step={1}
                    value={ringVolume}
                    aria-label="Ring and notification volume"
                    onChange={(event) => {
                      const val = Number(event.target.value);
                      triggerDetentHaptic('settings-ring', val);
                      onRingVolumeChange(val);
                    }}
                  />
                </div>

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={hapticsEnabled}
                  onClick={() => {
                    const next = !hapticsEnabled;
                    onHapticsChange(next);
                    if (next) triggerHaptic('success');
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="vibration" size={18} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Haptics</span>
                  </span>
                  <span className={`md3-switch${hapticsEnabled ? ' on' : ''}`} aria-hidden="true">
                    <span className="md3-switch-thumb" />
                  </span>
                </button>
              </div>
            </section>
          )}

          {matches.gestures && (
            <section className="settings-section">
              <h3 className="settings-heading">System</h3>
              <div className="settings-card">
                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={gestureNav}
                  onClick={() => {
                    triggerHaptic('tap');
                    onGestureNavChange(!gestureNav);
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="gesture" size={18} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Gesture navigation</span>
                  </span>
                  <span className={`md3-switch${gestureNav ? ' on' : ''}`} aria-hidden="true">
                    <span className="md3-switch-thumb" />
                  </span>
                </button>

                {gestureNav && (
                  <>
                    <div className="settings-divider" />
                    <div className="settings-segment-row">
                      <span className="settings-row-icon">
                        <Glyph name="swipe" size={18} />
                      </span>
                      <div className="settings-row-text">
                        <span className="settings-row-title">Back sensitivity</span>
                      </div>
                      <div className="md3-segmented">
                        {SENSITIVITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            className={`md3-seg-btn${backSensitivity === opt.id ? ' active' : ''}`}
                            onClick={() => {
                              triggerHaptic('tick');
                              onBackSensitivityChange(opt.id);
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-toggle-row"
                  role="switch"
                  aria-checked={lockOnWake}
                  onClick={() => {
                    triggerHaptic('tap');
                    onLockOnWakeChange(!lockOnWake);
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="lock" size={18} filled={lockOnWake} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Lock screen on wake</span>
                  </span>
                  <span className={`md3-switch${lockOnWake ? ' on' : ''}`} aria-hidden="true">
                    <span className="md3-switch-thumb" />
                  </span>
                </button>

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-action-row"
                  onClick={() => {
                    triggerHaptic('transition');
                    onLockNow();
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="screen_lock_portrait" size={18} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Lock device now</span>
                  </span>
                </button>
              </div>
            </section>
          )}

          {matches.about && (
            <section className="settings-section">
              <h3 className="settings-heading">About phone</h3>
              <div className="settings-card">
                <label className="settings-input-row">
                  <span className="settings-row-label">Device name</span>
                  <input
                    type="text"
                    className="settings-inline-input"
                    value={deviceName}
                    maxLength={28}
                    aria-label="Device name"
                    onChange={(event) => onDeviceNameChange(event.target.value)}
                  />
                </label>
                <div className="settings-row">
                  <span className="settings-row-label">Hardware</span>
                  <span className="settings-row-value">Tensor G3 · 12 GB</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Storage</span>
                  <span className="settings-row-value tabular">84.2 / 256 GB</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Launcher</span>
                  <span className="settings-row-value">WebDroid</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Android version</span>
                  <span className="settings-row-value">14 · Material You</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Security patch</span>
                  <span className="settings-row-value">Nov 5, 2026</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Kernel</span>
                  <span className="settings-row-value tabular">5.15.148-g3</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">IP address</span>
                  <span className="settings-row-value tabular">
                    {wifiOn && !airplane ? '192.168.1.42' : 'Unavailable'}
                  </span>
                </div>
                {developerMode && (
                  <div className="settings-row">
                    <span className="settings-row-label">Developer mode</span>
                    <span className="settings-row-value">Enabled</span>
                  </div>
                )}

                <div className="settings-divider" />

                <button
                  type="button"
                  className="settings-action-row"
                  onClick={() => {
                    triggerHaptic('tick');
                    onBuildNumberTap();
                  }}
                >
                  <span className="settings-row-icon">
                    <Glyph name="developer_mode" size={18} filled={developerMode} />
                  </span>
                  <span className="settings-row-text">
                    <span className="settings-row-title">Build number</span>
                    <span className="settings-row-sub tabular">AP2A.241105.008</span>
                  </span>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
