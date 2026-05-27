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
import { useLocalStorage } from './hooks/useLocalStorage';
import { useWeather } from './hooks/useWeather';
import { DEFAULT_RULES } from './utils/defaultRules';
import { Cloud, LayoutDashboard, ListChecks, SlidersHorizontal, MapPin } from 'lucide-react';
import './App.css';

const DEFAULT_PROFILE = {
  coldSensitivity: 'medium',
  heatSensitivity: 'medium',
  commuteTime: '08:00',
  preferredCity: '',
};

const NAV_ITEMS = [
  { id: '홈', icon: LayoutDashboard, label: '홈' },
  { id: '오늘의할일', icon: ListChecks, label: '오늘의 할일' },
  { id: '설정', icon: SlidersHorizontal, label: '개인 맞춤 설정' },
];

const MAX_LOCATIONS = 5;

export default function App() {
  const [locations, setLocations] = useLocalStorage('wt_locations', []);
  const [rules, setRules] = useLocalStorage('wt_rules', DEFAULT_RULES);
  const [profile, setProfile] = useLocalStorage('wt_profile', DEFAULT_PROFILE);
  const [selectedId, setSelectedId] = useLocalStorage('wt_selected', null);
  const [activeTab, setActiveTab] = useState('홈');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
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

  const handleAddCity = async (cityName) => {
    const trimmed = cityName.trim();
    setAddError(null);

    if (locations.length >= MAX_LOCATIONS) {
      setAddError(`최대 ${MAX_LOCATIONS}개 지역까지 추가할 수 있습니다.`);
      return;
    }

    const exists = locations.find(l => l.cityName.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setSelectedId(exists.id);
      return;
    }

    setIsAdding(true);
    const result = await fetchWeather(trimmed);

    if (!result) {
      setAddError(`"${trimmed}" 도시를 찾을 수 없습니다. 영문 도시명을 확인하세요.`);
      setIsAdding(false);
      return;
    }

    const resolvedName = result.current?.name ?? trimmed;
    const newLoc = { id: Date.now(), cityName: trimmed, label: resolvedName };
    setLocations(prev => [...prev, newLoc]);
    setSelectedId(newLoc.id);
    setIsAdding(false);
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
          <h1 className="app-title">Weather Tasks</h1>
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
              <CitySearch onAdd={handleAddCity} loading={isAdding} error={addError} />
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
