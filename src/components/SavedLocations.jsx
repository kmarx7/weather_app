import { MapPin, X, RefreshCw } from 'lucide-react';

export default function SavedLocations({ locations, selectedId, onSelect, onRemove, onRefresh, weatherMap }) {
  if (locations.length === 0) {
    return (
      <div className="empty-state">
        <MapPin size={32} className="empty-icon" />
        <p>저장된 지역이 없습니다. 도시를 추가하세요.</p>
      </div>
    );
  }

  return (
    <div className="saved-locations">
      {locations.map(loc => {
        const wd = weatherMap[loc.cityName];
        const temp = wd?.current?.main?.temp;
        const cond = wd?.current?.weather?.[0]?.main;
        const isLoading = wd?.loading;
        const hasError = wd?.error;

        return (
          <div
            key={loc.id}
            className={`location-chip ${selectedId === loc.id ? 'active' : ''}`}
            onClick={() => onSelect(loc.id)}
          >
            <div className="location-chip-main">
              <MapPin size={13} />
              <span className="location-name">{loc.label || loc.cityName}</span>
              {isLoading && <span className="badge badge-loading">로딩중</span>}
              {hasError && <span className="badge badge-error">오류</span>}
              {!isLoading && !hasError && temp !== undefined && (
                <span className="location-temp">{Math.round(temp)}°C</span>
              )}
              {!isLoading && !hasError && cond && (
                <span className="location-cond">{condIcon(cond)}</span>
              )}
            </div>
            <div className="location-chip-actions" onClick={e => e.stopPropagation()}>
              <button className="icon-btn" title="새로고침" onClick={() => onRefresh(loc.cityName)}>
                <RefreshCw size={12} />
              </button>
              <button className="icon-btn danger" title="삭제" onClick={() => onRemove(loc.id)}>
                <X size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function condIcon(main) {
  const map = { Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️', Snow: '❄️', Thunderstorm: '⛈️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️' };
  return map[main] ?? '🌡️';
}
