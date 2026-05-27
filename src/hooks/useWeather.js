import { useState, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';
const GEO = 'https://api.openweathermap.org/geo/1.0';

async function resolveCoords(cityName) {
  const res = await fetch(`${GEO}/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;
  return { lat: data[0].lat, lon: data[0].lon };
}

export function useWeather() {
  const [weatherMap, setWeatherMap] = useState({});

  const fetchWeather = useCallback(async (cityName) => {
    if (!cityName) return;

    setWeatherMap(prev => ({
      ...prev,
      [cityName]: { ...prev[cityName], loading: true, error: null },
    }));

    try {
      const coords = await resolveCoords(cityName);
      if (!coords) throw new Error('도시를 찾을 수 없습니다.');

      const { lat, lon } = coords;
      const coordParams = `lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;

      const [currentRes, forecastRes, airRes] = await Promise.all([
        fetch(`${BASE}/weather?${coordParams}`),
        fetch(`${BASE}/forecast?${coordParams}`),
        fetch(`${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
      ]);

      if (!currentRes.ok) {
        const err = await currentRes.json();
        throw new Error(err.message ?? '날씨 데이터를 불러오지 못했습니다.');
      }

      const current = await currentRes.json();
      const forecast = forecastRes.ok ? await forecastRes.json() : null;
      const air = airRes.ok ? await airRes.json() : null;

      setWeatherMap(prev => ({
        ...prev,
        [cityName]: {
          current,
          forecast: forecast?.list ?? [],
          airQuality: air?.list?.[0] ?? null,
          loading: false,
          error: null,
        },
      }));

      return { current, forecast: forecast?.list ?? [], airQuality: air?.list?.[0] ?? null };
    } catch (e) {
      setWeatherMap(prev => ({
        ...prev,
        [cityName]: { current: null, forecast: [], airQuality: null, loading: false, error: e.message },
      }));
      return null;
    }
  }, []);

  return { weatherMap, fetchWeather };
}
