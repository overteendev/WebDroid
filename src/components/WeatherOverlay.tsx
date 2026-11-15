import { useState } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { formatTemp, type TempUnit, type WeatherSnapshot } from '../utils/weather';
import { Glyph } from './Glyph';

export interface WeatherOverlayProps {
  open: boolean;
  weather: WeatherSnapshot;
  unit: TempUnit;
  onClose: () => void;
  onRefresh: () => void;
  onToggleUnit: () => void;
}

export function WeatherOverlay({
  open,
  weather,
  unit,
  onClose,
  onRefresh,
  onToggleUnit,
}: WeatherOverlayProps) {
  const [cycling, setCycling] = useState(false);

  function handleCycle(): void {
    triggerHaptic('tap');
    setCycling(true);
    onRefresh();
    window.setTimeout(() => setCycling(false), 360);
  }

  return (
    <div
      className={`folder-backdrop${open ? ' open' : ''}`}
      aria-hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          triggerHaptic('tick');
          onClose();
        }
      }}
    >
      <section className="weather-card" role="dialog" aria-label="Weather details">
        <header className="folder-card-head">
          <div className="folder-card-titles">
            <h2 className="folder-card-title">{weather.city}</h2>
            <span className="folder-card-count">Updated {weather.updatedAt}</span>
          </div>
          <button
            type="button"
            className="folder-card-close"
            aria-label="Close weather"
            onClick={() => {
              triggerHaptic('tick');
              onClose();
            }}
          >
            <Glyph name="close" size={18} />
          </button>
        </header>

        <div className={`weather-hero${cycling ? ' pulsing' : ''}`}>
          <span className="weather-hero-icon">
            <Glyph name={weather.icon} size={46} filled />
          </span>
          <div className="weather-hero-temp">{formatTemp(weather.tempC, unit)}</div>
          <div className="weather-hero-cond">{weather.condition}</div>
        </div>

        <div className="weather-metrics">
          <div className="weather-metric">
            <span className="weather-metric-label">Feels like</span>
            <span className="weather-metric-val">{formatTemp(weather.feelsLikeC, unit)}</span>
          </div>
          <div className="weather-metric">
            <span className="weather-metric-label">High / Low</span>
            <span className="weather-metric-val">
              {formatTemp(weather.highC, unit)} / {formatTemp(weather.lowC, unit)}
            </span>
          </div>
          <div className="weather-metric">
            <span className="weather-metric-label">Humidity</span>
            <span className="weather-metric-val">{weather.humidity}%</span>
          </div>
          <div className="weather-metric">
            <span className="weather-metric-label">Wind</span>
            <span className="weather-metric-val">{weather.windKmh} km/h</span>
          </div>
        </div>

        <div className="weather-actions">
          <button
            type="button"
            className="md3-tonal-btn"
            onClick={() => {
              triggerHaptic('tick');
              onToggleUnit();
            }}
          >
            <Glyph name="thermostat" size={18} />
            <span>Switch to °{unit === 'C' ? 'F' : 'C'}</span>
          </button>
          <button
            type="button"
            className={`md3-tonal-btn primary${cycling ? ' spinning' : ''}`}
            onClick={handleCycle}
          >
            <span className="weather-refresh-glyph">
              <Glyph name="refresh" size={18} />
            </span>
            <span>Cycle forecast</span>
          </button>
        </div>
      </section>
    </div>
  );
}
