import { Wind } from 'lucide-react';

const AQI_INFO = {
  1: { label: '좋음', color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', emoji: '😊' },
  2: { label: '보통', color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', emoji: '😐' },
  3: { label: '나쁨', color: '#f97316', bg: '#fff7ed', border: '#fdba74', emoji: '😷' },
  4: { label: '매우나쁨', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', emoji: '🤢' },
  5: { label: '최악', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', emoji: '☠️' },
};

function pm10Grade(v) {
  if (v <= 30) return 1;
  if (v <= 80) return 2;
  if (v <= 150) return 3;
  return 4;
}

function pm25Grade(v) {
  if (v <= 15) return 1;
  if (v <= 35) return 2;
  if (v <= 75) return 3;
  return 4;
}

function GradeBar({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="aq-bar-wrap">
      <div className="aq-bar-track">
        <div className="aq-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AirQuality({ airQuality }) {
  if (!airQuality) return null;

  const aqi = airQuality.main?.aqi ?? 1;
  const info = AQI_INFO[aqi] ?? AQI_INFO[1];
  const { pm2_5, pm10, no2, o3 } = airQuality.components ?? {};

  const pm10Info = AQI_INFO[pm10Grade(pm10)] ?? AQI_INFO[1];
  const pm25Info = AQI_INFO[pm25Grade(pm2_5)] ?? AQI_INFO[1];

  return (
    <div className="air-quality-card" style={{ background: info.bg, borderColor: info.border }}>
      <div className="aq-header">
        <div className="aq-title-row">
          <Wind size={15} />
          <span className="aq-title">미세먼지 / 대기질</span>
        </div>
        <div className="aq-aqi-badge" style={{ background: info.color }}>
          <span>{info.emoji}</span>
          <span>통합대기 {info.label}</span>
        </div>
      </div>

      <div className="aq-items">
        <div className="aq-item">
          <div className="aq-item-header">
            <span className="aq-item-label">미세먼지 PM10</span>
            <span className="aq-item-grade" style={{ color: pm10Info.color }}>{pm10Info.label}</span>
          </div>
          <GradeBar value={pm10} max={200} color={pm10Info.color} />
          <span className="aq-item-value">{pm10?.toFixed(1)} μg/m³</span>
        </div>

        <div className="aq-item">
          <div className="aq-item-header">
            <span className="aq-item-label">초미세먼지 PM2.5</span>
            <span className="aq-item-grade" style={{ color: pm25Info.color }}>{pm25Info.label}</span>
          </div>
          <GradeBar value={pm2_5} max={100} color={pm25Info.color} />
          <span className="aq-item-value">{pm2_5?.toFixed(1)} μg/m³</span>
        </div>

        <div className="aq-extras">
          <div className="aq-extra-item">
            <span className="aq-extra-label">이산화질소 NO₂</span>
            <span className="aq-extra-val">{no2?.toFixed(1)}</span>
          </div>
          <div className="aq-extra-item">
            <span className="aq-extra-label">오존 O₃</span>
            <span className="aq-extra-val">{o3?.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
