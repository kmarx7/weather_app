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
import ActivityLog from './components/ActivityLog';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useWeather } from './hooks/useWeather';
import { DEFAULT_RULES } from './utils/defaultRules';
import { Cloud, MapPin } from 'lucide-react';
import './App.css';

const DEFAULT_PROFILE = {
  coldSensitivity: 'medium',
  heatSensitivity: 'medium',
  commuteTime: '08:00',
  preferredCity: '',
};
const TABS = ['대시보드', '규칙 관리', '개인 설정', '실행 로그'];

function makeLog(message, type = 'info') {
  return {
    message,
    type,
    time: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }),
  };
}

export default function App() {
  const [locations, setLocations] = useLocalStorage('wt_locations', []);
  const [rules, setRules] = useLocalStorage('wt_rules', DEFAULT_RULES);
  const [profile, setProfile] = useLocalStorage('wt_profile', DEFAULT_PROFILE);
  const [selectedId, setSelectedId] = useLocalStorage('wt_selected', null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('대시보드');
  const [defaultLoaded, setDefaultLoaded] = useState(false);

  const { weatherMap, fetchWeather } = useWeather();

  const addLog = useCallback((message, type = 'info') => {
    setLogs(prev => [...prev.slice(-99), makeLog(message, type)]);
  }, []);

  const addCity = useCallback(async (cityName, silent = false) => {
    const trimmed = cityName.trim();
    if (!silent) addLog(`${trimmed} 날씨 조회 중...`);
    const result = await fetchWeather(trimmed);
    if (!result) {
      if (!silent) addLog(`${trimmed} 날씨 조회 실패 — 도시 이름을 영문으로 확인하세요.`, 'error');
      return null;
    }
    const resolvedName = result.current?.name ?? trimmed;
    const newLoc = { id: Date.now(), cityName: trimmed, label: resolvedName };
    setLocations(prev => [...prev, newLoc]);
    setSelectedId(newLoc.id);
    if (!silent) addLog(`${resolvedName} 지역 추가 완료`, 'success');
    return newLoc;
  }, [fetchWeather, addLog, setLocations, setSelectedId]);

  // On mount: load saved locations, or default to Seoul
  useEffect(() => {
    if (defaultLoaded) return;
    setDefaultLoaded(true);

    if (locations.length === 0) {
      addCity('Seoul', true).then(loc => {
        if (loc) addLog('서울을 기본 지역으로 추가했습니다.', 'success');
      });
    } else {
      locations.forEach(loc => {
        fetchWeather(loc.cityName).then(result => {
          if (result) addLog(`${loc.cityName} 날씨 로드 완료`, 'success');
          else addLog(`${loc.cityName} 날씨 로드 실패`, 'error');
        });
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddCity = async (cityName) => {
    const trimmed = cityName.trim();
    const exists = locations.find(l => l.cityName.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      addLog(`${trimmed}은(는) 이미 추가된 지역입니다.`, 'warn');
      setSelectedId(exists.id);
      return;
    }
    await addCity(trimmed);
  };

  const handleRemoveLocation = (id) => {
    const loc = locations.find(l => l.id === id);
    setLocations(prev => prev.filter(l => l.id !== id));
    if (selectedId === id) {
      const remaining = locations.filter(l => l.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
    if (loc) addLog(`${loc.label ?? loc.cityName} 지역 삭제`, 'info');
  };

  const handleRefresh = async (cityName) => {
    addLog(`${cityName} 새로고침 중...`);
    const result = await fetchWeather(cityName);
    if (result) addLog(`${cityName} 업데이트 완료`, 'success');
    else addLog(`${cityName} 업데이트 실패`, 'error');
  };

  const handleAddRule = (rule) => {
    setRules(prev => [...prev, rule]);
    addLog(`규칙 추가: ${rule.message}`, 'success');
  };

  const handleDeleteRule = (id) => {
    const rule = rules.find(r => r.id === id);
    setRules(prev => prev.filter(r => r.id !== id));
    if (rule) addLog(`규칙 삭제: ${rule.message}`, 'info');
  };

  const handleToggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const selectedLocation = locations.find(l => l.id === selectedId);
  const weatherData = selectedLocation ? weatherMap[selectedLocation.cityName] : null;
  const currentWeather = weatherData?.current ?? null;
  const forecast = weatherData?.forecast ?? [];
  const airQuality = weatherData?.airQuality ?? null;
  const isLoading = weatherData?.loading ?? false;
  const error = weatherData?.error ?? null;
  const forecastRules = rules.filter(r => r.scope === 'forecast');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Cloud size={22} className="header-icon" />
          <h1 className="app-title">Weather Tasks</h1>
          <span className="app-subtitle">날씨 기반 할 일 자동화</span>
        </div>
        <div className="header-right">
          {selectedLocation && (
            <span className="selected-badge">
              📍 {selectedLocation.label ?? selectedLocation.cityName}
            </span>
          )}
        </div>
      </header>

      <main className="main-content">
        <nav className="tab-nav">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === '대시보드' && (
          <div className="tab-content">
            <div className="dashboard-grid">
              {/* Left column */}
              <div className="col-left">
                <WeatherCard
                  weather={currentWeather}
                  loading={isLoading}
                  error={error}
                  cityName={selectedLocation?.label ?? selectedLocation?.cityName ?? '—'}
                  onRefresh={selectedLocation ? () => handleRefresh(selectedLocation.cityName) : null}
                />
                <AirQuality airQuality={airQuality} />
                <AiSummary
                  cityName={selectedLocation?.label ?? selectedLocation?.cityName ?? ''}
                  weather={currentWeather}
                  forecast={forecast}
                  tasks={rules}
                  forecastTasks={forecastRules}
                  profile={profile}
                />
                {/* Location section — below AI summary */}
                <div className="location-section">
                  <div className="location-section-header">
                    <MapPin size={15} />
                    <span>지역 관리</span>
                  </div>
                  <CitySearch onAdd={handleAddCity} loading={isLoading} />
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

              {/* Right column */}
              <div className="col-right">
                <TaskRecommendations weather={currentWeather} rules={rules} profile={profile} />
                <ForecastRecommendations forecast={forecast} rules={rules} />
              </div>
            </div>
          </div>
        )}

        {activeTab === '규칙 관리' && (
          <div className="tab-content">
            <RuleManager
              rules={rules}
              onAdd={handleAddRule}
              onDelete={handleDeleteRule}
              onToggle={handleToggleRule}
            />
          </div>
        )}

        {activeTab === '개인 설정' && (
          <div className="tab-content">
            <ProfileSettings profile={profile} onChange={setProfile} />
          </div>
        )}

        {activeTab === '실행 로그' && (
          <div className="tab-content">
            <ActivityLog logs={logs} onClear={() => setLogs([])} />
          </div>
        )}
      </main>
    </div>
  );
}
