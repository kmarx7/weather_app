import { Thermometer, Wind, Droplets, Eye, AlertCircle, RefreshCw } from 'lucide-react';

const CONDITION_MAP = {
  Clear: { label: '맑음', color: '#f59e0b', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)', icon: '☀️' },
  Clouds: { label: '흐림', color: '#64748b', bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', icon: '☁️' },
  Rain: { label: '비', color: '#3b82f6', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', icon: '🌧️' },
  Drizzle: { label: '이슬비', color: '#60a5fa', bg: 'linear-gradient(135deg,#eff6ff,#bfdbfe)', icon: '🌦️' },
  Thunderstorm: { label: '천둥번개', color: '#7c3aed', bg: 'linear-gradient(135deg,#f5f3ff,#ddd6fe)', icon: '⛈️' },
  Snow: { label: '눈', color: '#0ea5e9', bg: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)', icon: '❄️' },
  Mist: { label: '안개', color: '#94a3b8', bg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', icon: '🌫️' },
  Fog: { label: '짙은 안개', color: '#94a3b8', bg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', icon: '🌫️' },
  Haze: { label: '연무', color: '#d97706', bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)', icon: '🌫️' },
};

export default function WeatherCard({ weather, loading, error, cityName, onRefresh }) {
  if (loading) {
    return (
      <div className="weather-card skeleton">
        <div className="skeleton-line wide" />
        <div className="skeleton-line" />
        <div className="skeleton-line narrow" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-card error-card">
        <AlertCircle size={28} className="error-icon" />
        <div>
          <p className="error-title">날씨 데이터 오류</p>
          <p className="error-msg">{error}</p>
        </div>
        {onRefresh && (
          <button className="btn btn-ghost" onClick={onRefresh}><RefreshCw size={14} /> 재시도</button>
        )}
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-card empty-card">
        <p>날씨 데이터가 없습니다.</p>
      </div>
    );
  }

  const main = weather.weather?.[0]?.main ?? 'Clear';
  const theme = CONDITION_MAP[main] ?? { label: main, color: '#64748b', bg: '#f8fafc', icon: '🌡️' };
  const temp = Math.round(weather.main?.temp ?? 0);
  const feelsLike = Math.round(weather.main?.feels_like ?? 0);
  const humidity = weather.main?.humidity ?? 0;
  const windSpeed = weather.wind?.speed ?? 0;
  const visibility = weather.visibility ? (weather.visibility / 1000).toFixed(1) : null;
  const description = weather.weather?.[0]?.description ?? '';
  const updatedAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="weather-card" style={{ background: theme.bg, borderColor: `${theme.color}33` }}>
      <div className="weather-card-header">
        <div>
          <h2 className="weather-city">{cityName}</h2>
          <p className="weather-desc">{description}</p>
        </div>
        <div className="weather-icon-wrap">
          <span className="weather-big-icon">{theme.icon}</span>
          <span className="weather-condition-label" style={{ color: theme.color }}>{theme.label}</span>
        </div>
      </div>

      <div className="weather-temps">
        <span className="weather-temp-main" style={{ color: theme.color }}>{temp}°C</span>
        <span className="weather-feels">체감 {feelsLike}°C</span>
      </div>

      <div className="weather-stats">
        <div className="stat-item">
          <Droplets size={14} />
          <span>습도 {humidity}%</span>
        </div>
        <div className="stat-item">
          <Wind size={14} />
          <span>풍속 {windSpeed}m/s</span>
        </div>
        {visibility && (
          <div className="stat-item">
            <Eye size={14} />
            <span>가시거리 {visibility}km</span>
          </div>
        )}
        <div className="stat-item">
          <Thermometer size={14} />
          <span>최저 {Math.round(weather.main?.temp_min ?? 0)}° / 최고 {Math.round(weather.main?.temp_max ?? 0)}°</span>
        </div>
      </div>

      <div className="weather-footer">
        <span className="weather-updated">업데이트: {updatedAt}</span>
        {onRefresh && (
          <button className="icon-btn" onClick={onRefresh} title="새로고침">
            <RefreshCw size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
