import { useState, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';

export function useWeather() {
  const [weatherMap, setWeatherMap] = useState({});

  const fetchWeather = useCallback(async (cityName) => {
    if (!cityName) return;

    setWeatherMap(prev => ({
      ...prev,
      [cityName]: { ...prev[cityName], loading: true, error: null },
    }));

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${BASE}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=kr`),
        fetch(`${BASE}/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=kr`),
      ]);

      if (!currentRes.ok) {
        const err = await currentRes.json();
        throw new Error(err.message ?? '날씨 데이터를 불러오지 못했습니다.');
      }

      const current = await currentRes.json();
      const forecast = forecastRes.ok ? await forecastRes.json() : null;

      // Fetch air quality using coordinates from weather response
      const { lat, lon } = current.coord;
      const airRes = await fetch(`${BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
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
