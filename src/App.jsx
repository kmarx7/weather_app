import { useState, useEffect, useCallback } from 'react';
import CitySearch from './components/CitySearch';
import SavedLocations from './components/SavedLocations';
import WeatherCard from './components/WeatherCard';
import AirQuality from './components/AirQuality';
import TaskRecommendations from './components/TaskRecommendations';
import ForecastRecommendations from './components/ForecastRecommendations';
import RuleManager from './components/RuleManager';
import ProfileSettings from './components/ProfileSettings';
import AiSummary from './components/AiSummary';
import WeatherComparison from './components/WeatherComparison';
import WeeklyForecast from './components/WeeklyForecast';
import OutfitRecommendation from './components/OutfitRecommendation';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useWeather, searchCities, reverseGeocode } from './hooks/useWeather';
import { DEFAULT_RULES } from './utils/defaultRules';
import { Cloud, LayoutDashboard, ListChecks, SlidersHorizontal, MapPin } from 'lucide-react';
import './App.css';

const DEFAULT_PROFILE = {
  coldSensitivity: 'medium',
  heatSensitivity: 'medium',
  commuteTime: '08:00',
  preferredCity: '',
  gender: 'unisex',
  styles: ['casual'],
  outfitPriority: 'comfort',
};

const NAV_ITEMS = [
  { id: '홈', icon: LayoutDashboard, label: '홈' },
  { id: '오늘의할일', icon: ListChecks, label: '개인 규칙 관리' },
  { id: '설정', icon: SlidersHorizontal, label: '개인 맞춤 설정' },
];

const MAX_LOCATIONS = 4;

export default function App() {
  const [locations, setLocations] = useLocalStorage('wt_locations', []);
  const [rules, setRules] = useLocalStorage('wt_rules', DEFAULT_RULES);
  const [profile, setProfile] = useLocalStorage('wt_profile', DEFAULT_PROFILE);
  const [selectedId, setSelectedId] = useLocalStorage('wt_selected', null);
  const [activeTab, setActiveTab] = useState('홈');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [candidates, setCandidates] = useState(null);
  const [defaultLoaded, setDefaultLoaded] = useState(false);

  const { weatherMap, fetchWeather } = useWeather();

  const addCity = useCallback(async (cityName, silent = false) => {
    const trimmed = cityName.trim();
    const result = await fetchWeather(trimmed);
    if (!result) return null;
    const resolvedName = result.current?.name ?? trimmed;
    const newLoc = { id: Date.now(), cityName: trimmed, label: resolvedName };
    setLocations(prev => [...prev, newLoc]);
    setSelectedId(newLoc.id);
    return newLoc;
  }, [fetchWeather, setLocations, setSelectedId]);

  // On mount: load saved locations or default to Seoul
  useEffect(() => {
    if (defaultLoaded) return;
    setDefaultLoaded(true);
    if (locations.length === 0) {
      addCity('Seoul', true);
    } else {
      locations.forEach(loc => fetchWeather(loc.cityName));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (query) => {
    setAddError(null);
    setCandidates(null);

    if (locations.length >= MAX_LOCATIONS) {
      setAddError(`최대 ${MAX_LOCATIONS}개 지역까지 추가할 수 있습니다.`);
      return;
    }

    setIsAdding(true);
    const results = await searchCities(query);
    setIsAdding(false);

    if (!results.length) {
      setAddError(`"${query}" 검색 결과가 없습니다. 다른 이름으로 시도해 보세요.`);
      return;
    }

    if (results.length === 1) {
      await handleSelectCandidate(results[0], results[0].local_names?.ko ?? results[0].name);
    } else {
      setCandidates(results);
    }
  };

  const handleSelectCandidate = async (candidate, label) => {
    setCandidates(null);
    const cityName = label ?? candidate.local_names?.ko ?? candidate.name;

    const exists = locations.find(l => l.cityName === cityName);
    if (exists) { setSelectedId(exists.id); return; }

    setIsAdding(true);
    const result = await fetchWeather(cityName);
    setIsAdding(false);

    if (!result) {
      setAddError(`"${cityName}" 날씨 데이터를 불러오지 못했습니다.`);
      return;
    }

    const resolvedLabel = result.current?.name ?? cityName;
    const newLoc = { id: Date.now(), cityName, label: resolvedLabel };
    setLocations(prev => [...prev, newLoc]);
    setSelectedId(newLoc.id);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setAddError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }
    if (locations.length >= MAX_LOCATIONS) {
      setAddError(`최대 ${MAX_LOCATIONS}개 지역까지 추가할 수 있습니다.`);
      return;
    }
    setAddError(null);
    setCandidates(null);
    setIsAdding(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const geo = await reverseGeocode(coords.latitude, coords.longitude);
        if (!geo) {
          setAddError('현재 위치의 도시를 찾을 수 없습니다.');
          setIsAdding(false);
          return;
        }
        const exists = locations.find(l => l.cityName === geo.name);
        if (exists) { setSelectedId(exists.id); setIsAdding(false); return; }

        const result = await fetchWeather(geo.name);
        setIsAdding(false);
        if (!result) { setAddError('현재 위치 날씨를 불러올 수 없습니다.'); return; }

        const newLoc = { id: Date.now(), cityName: geo.name, label: result.current?.name ?? geo.name };
        setLocations(prev => [...prev, newLoc]);
        setSelectedId(newLoc.id);
      },
      (err) => {
        setAddError(err.code === 1 ? '위치 권한이 거부되었습니다. 브라우저 설정을 확인하세요.' : '위치를 가져올 수 없습니다.');
        setIsAdding(false);
      },
      { timeout: 10000 }
    );
  };

  const handleRemoveLocation = (id) => {
    setLocations(prev => prev.filter(l => l.id !== id));
    if (selectedId === id) {
      const remaining = locations.filter(l => l.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRefresh = (cityName) => fetchWeather(cityName);

  const handleAddRule = (rule) => setRules(prev => [...prev, rule]);
  const handleDeleteRule = (id) => setRules(prev => prev.filter(r => r.id !== id));
  const handleToggleRule = (id) => setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const selectedLocation = locations.find(l => l.id === selectedId);
  const weatherData = selectedLocation ? weatherMap[selectedLocation.cityName] : null;
  const currentWeather = weatherData?.current ?? null;
  const forecast = weatherData?.forecast ?? [];
  const airQuality = weatherData?.airQuality ?? null;
  const airForecast = weatherData?.airForecast ?? [];
  const isLoading = weatherData?.loading ?? false;
  const error = weatherData?.error ?? null;
  const forecastRules = rules.filter(r => r.scope === 'forecast');
  const cityLabel = selectedLocation?.label ?? selectedLocation?.cityName ?? null;

  return (
    <div className="app">
      {/* ── Fixed Header ── */}
      <header className="app-header">
        <div className="header-left">
          <Cloud size={20} className="header-icon" />
          <h1 className="app-title">날씨를 읽어 드립니다</h1>
        </div>
        {cityLabel && (
          <div className="header-city">
            <MapPin size={13} />
            <span>{cityLabel}</span>
          </div>
        )}
      </header>

      {/* ── Scrollable Main ── */}
      <main className="main-content">
        <div className="page-content">

          {/* Location bar — always at top */}
          <div className="location-bar">
            <div className="location-bar-title">
              <MapPin size={15} />
              <span>지역 관리</span>
            </div>
            <div className="location-bar-body">
              <CitySearch
                onSearch={handleSearch}
                onSelect={handleSelectCandidate}
                onLocate={handleLocate}
                candidates={candidates}
                loading={isAdding}
                error={addError}
                onClear={() => { setCandidates(null); setAddError(null); }}
              />
              <SavedLocations
                locations={locations}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onRemove={handleRemoveLocation}
                onRefresh={handleRefresh}
                weatherMap={weatherMap}
              />
            </div>
          </div>

          {/* Tab nav — sticky, below location bar */}
          <nav className="content-tab-nav">
            {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                className={`content-tab-btn ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* ── 홈 ── */}
          {activeTab === '홈' && (
            <div className="dashboard-grid">
              <div className="dg-weather">
                <WeatherCard
                  weather={currentWeather}
                  loading={isLoading}
                  error={error}
                  cityName={cityLabel ?? '—'}
                  onRefresh={selectedLocation ? () => handleRefresh(selectedLocation.cityName) : null}
                />
              </div>
              <div className="dg-air">
                <AirQuality airQuality={airQuality} />
              </div>
              <div className="dg-summary">
                <AiSummary
                  cityName={cityLabel ?? ''}
                  weather={currentWeather}
                  forecast={forecast}
                  tasks={rules}
                  forecastTasks={forecastRules}
                  profile={profile}
                />
              </div>
              <div className="dg-tasks">
                <TaskRecommendations weather={currentWeather} rules={rules} profile={profile} />
              </div>
              <div className="dg-weekly">
                <WeeklyForecast forecast={forecast} airForecast={airForecast} />
              </div>
              <div className="dg-outfit">
                <OutfitRecommendation weather={currentWeather} airQuality={airQuality} profile={profile} />
              </div>
              <div className="dg-forecast">
                <ForecastRecommendations forecast={forecast} rules={rules} />
              </div>
              <div className="dg-compare">
                <WeatherComparison locations={locations} weatherMap={weatherMap} />
              </div>
            </div>
          )}

          {/* ── 오늘의 할일 ── */}
          {activeTab === '오늘의할일' && (
            <RuleManager
              rules={rules}
              onAdd={handleAddRule}
              onDelete={handleDeleteRule}
              onToggle={handleToggleRule}
            />
          )}

          {/* ── 설정 ── */}
          {activeTab === '설정' && (
            <ProfileSettings profile={profile} onChange={setProfile} />
          )}

        </div>
      </main>
    </div>
  );
}
