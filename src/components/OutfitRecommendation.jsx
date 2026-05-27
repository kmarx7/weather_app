import { Shirt } from 'lucide-react';

const TAG_STYLE = {
  필수: { background: '#fef2f2', color: '#ef4444', borderColor: '#fca5a5' },
  주의: { background: '#fff7ed', color: '#f97316', borderColor: '#fdba74' },
  추천: { background: '#eef2ff', color: '#6366f1', borderColor: '#c7d2fe' },
  적합: { background: '#f0fdf4', color: '#16a34a', borderColor: '#86efac' },
};

function buildOutfits(weather, airQuality) {
  const temp = weather.main?.temp ?? 20;
  const condition = weather.weather?.[0]?.main ?? 'Clear';
  const wind = weather.wind?.speed ?? 0;
  const aqi = airQuality?.main?.aqi ?? 1;

  const items = [];

  if (temp < 0) {
    items.push({ emoji: '🧥', text: '두꺼운 패딩 또는 롱코트', tag: '필수' });
    items.push({ emoji: '🧣', text: '목도리 · 장갑 · 귀마개', tag: '필수' });
    items.push({ emoji: '👖', text: '기모 바지 또는 내복 착용', tag: '추천' });
  } else if (temp < 5) {
    items.push({ emoji: '🧥', text: '두꺼운 코트 또는 패딩', tag: '필수' });
    items.push({ emoji: '🧣', text: '목도리 · 장갑 착용', tag: '추천' });
    items.push({ emoji: '👕', text: '두꺼운 니트 레이어링', tag: '추천' });
  } else if (temp < 10) {
    items.push({ emoji: '🧥', text: '코트 또는 두꺼운 재킷', tag: '필수' });
    items.push({ emoji: '👕', text: '니트 또는 맨투맨', tag: '추천' });
  } else if (temp < 17) {
    items.push({ emoji: '🧥', text: '가벼운 재킷 또는 블레이저', tag: '필수' });
    items.push({ emoji: '👕', text: '긴팔 티셔츠', tag: '추천' });
  } else if (temp < 23) {
    items.push({ emoji: '👕', text: '얇은 가디건 또는 긴팔', tag: '적합' });
    items.push({ emoji: '👖', text: '청바지 또는 면바지', tag: '적합' });
  } else if (temp < 28) {
    items.push({ emoji: '👕', text: '반팔 티셔츠', tag: '적합' });
    items.push({ emoji: '🩳', text: '반바지 또는 얇은 면바지', tag: '적합' });
  } else {
    items.push({ emoji: '👕', text: '민소매 또는 반팔', tag: '적합' });
    items.push({ emoji: '🩳', text: '반바지', tag: '적합' });
    items.push({ emoji: '🕶️', text: '자외선 차단제 · 선글라스', tag: '필수' });
  }

  if (condition === 'Rain' || condition === 'Drizzle') {
    items.push({ emoji: '☂️', text: '우산 또는 우비', tag: '필수' });
    items.push({ emoji: '👟', text: '방수 신발 권장', tag: '추천' });
  }
  if (condition === 'Snow') {
    items.push({ emoji: '🥾', text: '방한 · 방수 부츠', tag: '필수' });
  }
  if (condition === 'Thunderstorm') {
    items.push({ emoji: '⚡', text: '실외활동 자제 · 우산 필수', tag: '주의' });
  }
  if (wind >= 9) {
    items.push({ emoji: '🌬️', text: '바람막이 재킷 착용', tag: '추천' });
  }
  if (aqi >= 3) {
    items.push({ emoji: '😷', text: `미세먼지 ${aqi >= 4 ? '매우나쁨' : '나쁨'} — 마스크 착용`, tag: '필수' });
  }

  return items;
}

function tempLabel(temp) {
  if (temp < 0) return '매우 추움';
  if (temp < 5) return '아주 추움';
  if (temp < 10) return '추움';
  if (temp < 17) return '쌀쌀함';
  if (temp < 23) return '선선함';
  if (temp < 28) return '따뜻함';
  return '더움';
}

export default function OutfitRecommendation({ weather, airQuality }) {
  if (!weather) {
    return (
      <div className="outfit-card">
        <h3 className="section-title"><Shirt size={16} /> 추천 코디</h3>
        <p className="empty-tasks">날씨 데이터를 불러오면 코디를 추천해 드립니다.</p>
      </div>
    );
  }

  const temp = weather.main?.temp ?? 20;
  const items = buildOutfits(weather, airQuality);

  return (
    <div className="outfit-card">
      <div className="outfit-header">
        <h3 className="section-title"><Shirt size={16} /> 추천 코디</h3>
        <span className="outfit-temp-label">{Math.round(temp)}°C · {tempLabel(temp)}</span>
      </div>
      <div className="outfit-list">
        {items.map((item, i) => {
          const s = TAG_STYLE[item.tag] ?? TAG_STYLE['추천'];
          return (
            <div key={i} className="outfit-item">
              <span className="outfit-emoji">{item.emoji}</span>
              <span className="outfit-text">{item.text}</span>
              <span className="outfit-tag" style={s}>{item.tag}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
