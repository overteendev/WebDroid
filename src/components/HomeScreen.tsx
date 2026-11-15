import { APP_CATEGORIES, type AppCategory, type AppDef } from '../data/apps';
import { triggerHaptic } from '../utils/haptics';
import { formatTemp, type TempUnit, type WeatherSnapshot } from '../utils/weather';
import { AppIcon } from './AppIcon';
import { AppTile } from './AppTile';
import { ClockWidget } from './ClockWidget';
import { FolderTile } from './FolderTile';
import { Glyph } from './Glyph';

export interface HomeScreenProps {
  compactDate: string;
  hours: number;
  minutes: number;
  seconds: number;
  weather: WeatherSnapshot;
  tempUnit: TempUnit;
  allApps: AppDef[];
  pinnedHomeApps: AppDef[];
  dockApps: AppDef[];
  onOpenWeather: () => void;
  onOpenFolder: (category: AppCategory) => void;
  onLaunch: (app: AppDef, originRect?: DOMRect) => void;
  onLongPressApp: (app: AppDef, rect: DOMRect) => void;
  onOpenDrawer: () => void;
}

export function HomeScreen({
  compactDate,
  hours,
  minutes,
  seconds,
  weather,
  tempUnit,
  allApps,
  pinnedHomeApps,
  dockApps,
  onOpenWeather,
  onOpenFolder,
  onLaunch,
  onLongPressApp,
  onOpenDrawer,
}: HomeScreenProps) {
  return (
    <div className="home">
      <section className="home-widgets" aria-label="Clock and weather widgets">
        <ClockWidget
          compactDate={compactDate}
          hours={hours}
          minutes={minutes}
          seconds={seconds}
        />

        <button
          type="button"
          className="weather-widget-card"
          aria-label={`Weather in ${weather.city}: ${weather.condition}, ${formatTemp(weather.tempC, tempUnit)}. Tap for details.`}
          onClick={() => {
            triggerHaptic('tap');
            onOpenWeather();
          }}
        >
          <div className="weather-widget-top">
            <span className="weather-widget-icon">
              <Glyph name={weather.icon} size={28} filled />
            </span>
            <span className="weather-widget-temp">
              {formatTemp(weather.tempC, tempUnit)}
            </span>
          </div>
          <div className="weather-widget-cond">{weather.condition}</div>
          <div className="weather-widget-meta">
            <span>{weather.city}</span>
            <span>
              H:{formatTemp(weather.highC, tempUnit)} · L:{formatTemp(weather.lowC, tempUnit)}
            </span>
          </div>
        </button>
      </section>

      <div className="app-grid">
        {APP_CATEGORIES.map((category) => {
          const categoryApps = allApps.filter(
            (app) => !app.isShortcut && app.category === category,
          );
          if (categoryApps.length === 0) return null;
          return (
            <FolderTile
              key={category}
              category={category}
              apps={categoryApps}
              onOpen={onOpenFolder}
            />
          );
        })}

        {pinnedHomeApps.map((app) => (
          <AppTile
            key={app.id}
            app={app}
            onLaunch={onLaunch}
            onLongPress={onLongPressApp}
          />
        ))}
      </div>

      <button
        type="button"
        className="search-pill"
        aria-label="Search apps"
        onClick={() => {
          triggerHaptic('transition');
          onOpenDrawer();
        }}
      >
        <span className="search-google-mark" aria-hidden="true">
          <AppIcon icon="fa-brands fa-google" size={16} />
        </span>
        <span className="search-label">Search</span>
        <span className="search-spacer" />
        <span className="search-trailing" aria-hidden="true">
          <Glyph name="mic" size={19} />
          <Glyph name="center_focus_strong" size={18} />
        </span>
      </button>

      <nav className="dock" aria-label="Dock">
        {dockApps.map((app) => (
          <AppTile
            key={app.id}
            app={app}
            label={false}
            onLaunch={onLaunch}
            onLongPress={onLongPressApp}
          />
        ))}
      </nav>
    </div>
  );
}
