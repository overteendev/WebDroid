export type TempUnit = 'C' | 'F';

export interface WeatherSnapshot {
  id: string;
  city: string;
  condition: string;
  icon: string;
  tempC: number;
  feelsLikeC: number;
  highC: number;
  lowC: number;
  humidity: number;
  windKmh: number;
  updatedAt: string;
}

const MOCK_FORECASTS: Omit<WeatherSnapshot, 'updatedAt'>[] = [
  {
    id: 'partly-cloudy',
    city: 'Local Weather',
    condition: 'Partly cloudy',
    icon: 'partly_cloudy_day',
    tempC: 24,
    feelsLikeC: 25,
    highC: 28,
    lowC: 19,
    humidity: 54,
    windKmh: 12,
  },
  {
    id: 'sunny',
    city: 'Local Weather',
    condition: 'Clear & sunny',
    icon: 'sunny',
    tempC: 29,
    feelsLikeC: 30,
    highC: 32,
    lowC: 21,
    humidity: 38,
    windKmh: 9,
  },
  {
    id: 'rainy',
    city: 'Local Weather',
    condition: 'Light showers',
    icon: 'rainy',
    tempC: 20,
    feelsLikeC: 19,
    highC: 22,
    lowC: 17,
    humidity: 82,
    windKmh: 18,
  },
  {
    id: 'breezy',
    city: 'Local Weather',
    condition: 'Breezy & mild',
    icon: 'air',
    tempC: 22,
    feelsLikeC: 21,
    highC: 25,
    lowC: 16,
    humidity: 48,
    windKmh: 24,
  },
];

function formatNow(): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

export function getWeatherSnapshot(index = 0): WeatherSnapshot {
  const safeIndex = ((index % MOCK_FORECASTS.length) + MOCK_FORECASTS.length) % MOCK_FORECASTS.length;
  return {
    ...MOCK_FORECASTS[safeIndex],
    updatedAt: formatNow(),
  };
}

export function getNextWeatherIndex(currentIndex: number): number {
  return (currentIndex + 1) % MOCK_FORECASTS.length;
}

export function formatTemp(tempC: number, unit: TempUnit): string {
  if (unit === 'F') {
    return `${Math.round((tempC * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(tempC)}°C`;
}
