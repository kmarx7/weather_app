import { useState, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = 'https://api.openweathermap.org/data/2.5';
const NOMINATIM = 'https://nominatim.openstreetmap.org';

const NOMINATIM_HEADERS = { 'User-Agent': 'WeatherTasks/1.0 (personal weather app)' };

function isKorean(text) {
  return /[가-힣ㄱ-ㆎ]/.test(text);
}

async function nominatimSearch(query, limit = 5) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: String(limit),
    'accept-language': 'ko',
  });
  if (isKorean(query)) params.set('countrycodes', 'kr');
  try {
    const res = await fetch(`${NOMINATIM}/search?${params}`, { headers: NOMINATIM_HEADERS });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function pickName(addr, fallback) {
  return (
    addr.city ?? addr.town ?? addr.village ?? addr.county ??
    addr.municipality ?? addr.suburb ?? fallback ?? ''
  );
}

function toCandidate(r) {
  const addr = r.address ?? {};
  const name = pickName(addr, r.display_name?.split(',')[0]);
  const state = addr.state ?? addr.province ?? addr.region ?? '';
  const country = (addr.country_code ?? '').toUpperCase();
  const flag = { KR: '🇰🇷', JP: '🇯🇵', US: '🇺🇸', CN: '🇨🇳', GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪' }[country] ?? '🌍';
  const region = [state, country !== 'KR' ? country : null].filter(Boolean).join(' · ');
  return {
    name,
    region,
    flag,
    country,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  };
}

// 좌표 → 도시명 (역지오코딩)
export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat), lon: String(lon),
    format: 'json', 'accept-language': 'ko',
  });
  try {
    const res = await fetch(`${NOMINATIM}/reverse?${params}`, { headers: NOMINATIM_HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address ?? {};
    const name = addr.city ?? addr.town ?? addr.village ?? addr.county ?? addr.suburb ?? null;
    return name ? { name, lat, lon } : null;
  } catch {
    return null;
  }
}

// 후보 목록 반환 (Nominatim — 한글 소도시 완전 지원)
export async function searchCities(query) {
  // 공백이 있으면 마지막 토큰도 시도 ("경기 안산" → "안산")
  const queries = [query];
  if (query.includes(' ')) queries.push(query.split(' ').pop());

  let raw = [];
  for (const q of queries) {
    raw = await nominatimSearch(q, 8);
    if (raw.length) break;
  }

  const placeClasses = new Set(['place', 'boundary', 'administrative']);
  const filtered = raw.filter(r => placeClasses.has(r.class) || r.type === 'administrative');

  // 이름 기준 중복 제거
  const seen = new Set();
  const result = [];
  for (const r of filtered) {
    const c = toCandidate(r);
    if (c.name && !seen.has(c.name)) {
      seen.add(c.name);
      result.push(c);
    }
  }
  return result.slice(0, 5);
}

// 좌표 조회 (Nominatim)
async function resolveCoords(cityName) {
  const raw = await nominatimSearch(cityName, 1);
  if (!raw.length) return null;
  return { lat: parseFloat(raw[0].lat), lon: parseFloat(raw[0].lon) };
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
