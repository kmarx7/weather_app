import { GitCompare, RefreshCw } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CONDITION_ICON = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Snow: '❄️', Thunderstorm: '⛈️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
};

const AQI_LABEL = { 1: '좋음', 2: '보통', 3: '나쁨', 4: '매우나쁨', 5: '최악' };
const AQI_COLOR = { 1: '#10b981', 2: '#f59e0b', 3: '#f97316', 4: '#ef4444', 5: '#7c3aed' };

function pm25Grade(v) {
  if (v <= 15) return 1; if (v <= 35) return 2; if (v <= 75) return 3; return 4;
}

function Row({ label, v1, v2, unit = '', lowerBetter = false, noCompare = false }) {
  const n1 = parseFloat(v1);
  const n2 = parseFloat(v2);
  const hasDiff = !noCompare && !isNaN(n1) && !isNaN(n2) && n1 !== n2;

  let c1 = '', c2 = '';
  if (hasDiff) {
    const [better, worse] = lowerBetter ? ['comp-better', 'comp-worse'] : ['comp-warm', 'comp-cool'];
    c1 = n1 < n2 ? (lowerBetter ? better : worse) : (lowerBetter ? worse : better);
    c2 = n2 < n1 ? (lowerBetter ? better : worse) : (lowerBetter ? worse : better);
  }

  return (
    <div className="comp-row">
      <div className="comp-metric">{label}</div>
      <div className={`comp-cell ${c1}`}>{v1 != null ? `${v1}${unit}` : '—'}</div>
      <div className={`comp-cell ${c2}`}>{v2 != null ? `${v2}${unit}` : '—'}</div>
    </div>
  );
}

export default function WeatherComparison({ locations, weatherMap, onRefresh }) {
  const [id1, setId1] = useLocalStorage('wt_cmp1', null);
  const [id2, setId2] = useLocalStorage('wt_cmp2', null);

  if (locations.length < 2) {
    return (
      <div className="comparison-card">
        <h3 className="section-title"><GitCompare size={16} /> 날씨 비교</h3>
        <p className="empty-tasks">지역을 2개 이상 추가하면 비교할 수 있습니다.</p>
      </div>
    );
  }

  const loc1 = locations.find(l => l.id === id1) ?? locations[0];
  const loc2 = locations.find(l => l.id === id2) ?? locations[1];

  const wd1 = weatherMap[loc1?.cityName];
  const wd2 = weatherMap[loc2?.cityName];
  const w1 = wd1?.current;
  const w2 = wd2?.current;
  const air1 = wd1?.airQuality;
  const air2 = wd2?.airQuality;

  const condIcon1 = CONDITION_ICON[w1?.weather?.[0]?.main] ?? '🌡️';
  const condIcon2 = CONDITION_ICON[w2?.weather?.[0]?.main] ?? '🌡️';
  const aqi1 = air1?.main?.aqi;
  const aqi2 = air2?.main?.aqi;

  return (
    <div className="comparison-card">
      <h3 className="section-title"><GitCompare size={16} /> 날씨 비교</h3>

      {/* City selectors */}
      <div className="comp-selectors">
        <select
          value={loc1?.id ?? ''}
          onChange={e => setId1(locations.find(l => String(l.id) === e.target.value)?.id)}
          className="comp-select"
        >
          {locations.map(l => (
            <option key={l.id} value={l.id}>{l.label ?? l.cityName}</option>
          ))}
        </select>
        <span className="vs-badge">VS</span>
        <select
          value={loc2?.id ?? ''}
          onChange={e => setId2(locations.find(l => String(l.id) === e.target.value)?.id)}
          className="comp-select"
        >
          {locations.map(l => (
            <option key={l.id} value={l.id}>{l.label ?? l.cityName}</option>
          ))}
        </select>
      </div>

      {/* Big temp summary */}
      {(w1 || w2) && (
        <div className="comp-summary">
          <div className="comp-summary-city">
            <span className="comp-icon">{condIcon1}</span>
            <span className="comp-name">{loc1?.label ?? loc1?.cityName}</span>
            <span className="comp-big-temp">
              {w1 ? `${Math.round(w1.main.temp)}°C` : '—'}
            </span>
            <span className="comp-desc">{w1?.weather?.[0]?.description ?? ''}</span>
          </div>
          <div className="comp-summary-divider" />
          <div className="comp-summary-city">
            <span className="comp-icon">{condIcon2}</span>
            <span className="comp-name">{loc2?.label ?? loc2?.cityName}</span>
            <span className="comp-big-temp">
              {w2 ? `${Math.round(w2.main.temp)}°C` : '—'}
            </span>
            <span className="comp-desc">{w2?.weather?.[0]?.description ?? ''}</span>
          </div>
        </div>
      )}

      {/* Detail rows */}
      <div className="comp-table">
        <div className="comp-header-row">
          <div className="comp-metric" />
          <div className="comp-city-label">{loc1?.label ?? loc1?.cityName}</div>
          <div className="comp-city-label">{loc2?.label ?? loc2?.cityName}</div>
        </div>

        <Row label="체감온도"
          v1={w1 ? Math.round(w1.main.feels_like) : null}
          v2={w2 ? Math.round(w2.main.feels_like) : null}
          unit="°C" noCompare
        />
        <Row label="습도"
          v1={w1?.main?.humidity}
          v2={w2?.main?.humidity}
          unit="%" lowerBetter
        />
        <Row label="풍속"
          v1={w1?.wind?.speed?.toFixed(1)}
          v2={w2?.wind?.speed?.toFixed(1)}
          unit="m/s" lowerBetter
        />
        <Row label="PM2.5"
          v1={air1?.components?.pm2_5?.toFixed(1)}
          v2={air2?.components?.pm2_5?.toFixed(1)}
          unit="μg/m³" lowerBetter
        />
        <Row label="PM10"
          v1={air1?.components?.pm10?.toFixed(1)}
          v2={air2?.components?.pm10?.toFixed(1)}
          unit="μg/m³" lowerBetter
        />

        {/* AQI row */}
        <div className="comp-row">
          <div className="comp-metric">대기질</div>
          <div className="comp-cell">
            {aqi1 ? (
              <span className="aqi-chip" style={{ background: AQI_COLOR[aqi1] }}>
                {AQI_LABEL[aqi1]}
              </span>
            ) : '—'}
          </div>
          <div className="comp-cell">
            {aqi2 ? (
              <span className="aqi-chip" style={{ background: AQI_COLOR[aqi2] }}>
                {AQI_LABEL[aqi2]}
              </span>
            ) : '—'}
          </div>
        </div>
      </div>

      {(wd1?.loading || wd2?.loading) && (
        <p className="comp-loading"><RefreshCw size={13} className="spin" /> 날씨 불러오는 중...</p>
      )}
    </div>
  );
}
