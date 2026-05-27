import { Shirt } from 'lucide-react';

const TAG_STYLE = {
  필수: { background: '#fef2f2', color: '#ef4444', borderColor: '#fca5a5' },
  주의: { background: '#fff7ed', color: '#f97316', borderColor: '#fdba74' },
  추천: { background: '#eef2ff', color: '#6366f1', borderColor: '#c7d2fe' },
  적합: { background: '#f0fdf4', color: '#16a34a', borderColor: '#86efac' },
};

const STYLE_LABEL = {
  casual: '캐주얼', business: '비즈니스', sporty: '스포티',
  street: '스트리트', minimal: '미니멀', outdoor: '아웃도어',
};

// temp offset by cold/heat sensitivity
function adjustedTemp(temp, profile) {
  let t = temp;
  if (profile?.coldSensitivity === 'high') t -= 3;
  if (profile?.coldSensitivity === 'low')  t += 3;
  if (profile?.heatSensitivity === 'high') t += 3;
  if (profile?.heatSensitivity === 'low')  t -= 3;
  return t;
}

function buildOutfits(weather, airQuality, profile) {
  const rawTemp = weather.main?.temp ?? 20;
  const temp = adjustedTemp(rawTemp, profile);
  const condition = weather.weather?.[0]?.main ?? 'Clear';
  const wind = weather.wind?.speed ?? 0;
  const aqi = airQuality?.main?.aqi ?? 1;

  const gender = profile?.gender ?? 'unisex';
  const styles = profile?.styles ?? ['casual'];
  const priority = profile?.outfitPriority ?? 'comfort';

  const isFemale = gender === 'female';
  const isMale = gender === 'male';
  const isBusiness = styles.includes('business');
  const isSporty = styles.includes('sporty');
  const isStreet = styles.includes('street');
  const isMinimal = styles.includes('minimal');
  const isOutdoor = styles.includes('outdoor');
  const styleFirst = priority === 'style';
  const warmthFirst = priority === 'warmth';

  const items = [];

  // ── 기온별 베이스 아이템 ──
  if (temp < 0) {
    if (isFemale) {
      items.push({ emoji: '🧥', text: isMinimal ? '롱 울코트' : isBusiness ? '롱 캐시미어 코트' : '두꺼운 패딩 점퍼', tag: '필수' });
      items.push({ emoji: '🧣', text: '두꺼운 머플러 · 장갑 · 귀마개', tag: '필수' });
      items.push({ emoji: '👖', text: isStreet ? '기모 레깅스 + 오버사이즈 코트' : '기모 슬랙스 또는 두꺼운 스타킹', tag: '추천' });
    } else if (isMale) {
      items.push({ emoji: '🧥', text: isBusiness ? '울 오버코트' : '롱 패딩 점퍼', tag: '필수' });
      items.push({ emoji: '🧣', text: '목도리 · 장갑 · 모자', tag: '필수' });
      items.push({ emoji: '👖', text: '기모 청바지 또는 두꺼운 면바지 + 내복', tag: '추천' });
    } else {
      items.push({ emoji: '🧥', text: '두꺼운 패딩 또는 롱코트', tag: '필수' });
      items.push({ emoji: '🧣', text: '목도리 · 장갑 · 귀마개', tag: '필수' });
      items.push({ emoji: '👖', text: '기모 바지 + 내복 착용', tag: '추천' });
    }
  } else if (temp < 5) {
    if (isFemale) {
      items.push({ emoji: '🧥', text: isBusiness ? '울 코트' : isStreet ? '오버사이즈 패딩' : '두꺼운 코트', tag: '필수' });
      items.push({ emoji: '👕', text: '터틀넥 니트', tag: '추천' });
      items.push({ emoji: '🧣', text: '목도리 · 장갑', tag: '추천' });
    } else if (isMale) {
      items.push({ emoji: '🧥', text: isBusiness ? '울 코트 + 정장' : '두꺼운 아우터', tag: '필수' });
      items.push({ emoji: '👕', text: '두꺼운 니트 또는 후디', tag: '추천' });
      items.push({ emoji: '🧣', text: '목도리 · 장갑', tag: '추천' });
    } else {
      items.push({ emoji: '🧥', text: '두꺼운 코트 또는 패딩', tag: '필수' });
      items.push({ emoji: '👕', text: '두꺼운 니트 레이어링', tag: '추천' });
    }
  } else if (temp < 10) {
    if (isFemale) {
      items.push({ emoji: '🧥', text: isBusiness ? '트렌치코트 + 재킷' : isMinimal ? '베이직 울 코트' : '가벼운 코트', tag: '필수' });
      items.push({ emoji: '👕', text: '니트 또는 블라우스', tag: '추천' });
    } else if (isMale) {
      items.push({ emoji: '🧥', text: isBusiness ? '재킷 + 코트' : isSporty ? '플리스 집업' : '가벼운 아우터', tag: '필수' });
      items.push({ emoji: '👕', text: '맨투맨 또는 니트', tag: '추천' });
    } else {
      items.push({ emoji: '🧥', text: '코트 또는 두꺼운 재킷', tag: '필수' });
      items.push({ emoji: '👕', text: '니트 또는 맨투맨', tag: '추천' });
    }
  } else if (temp < 17) {
    if (isFemale) {
      items.push({ emoji: '🧥', text: isBusiness ? '블레이저' : isStreet ? '오버핏 재킷' : isMinimal ? '린넨 재킷' : '가디건 또는 재킷', tag: '필수' });
      items.push({ emoji: '👕', text: '긴팔 티셔츠 또는 얇은 니트', tag: '추천' });
      items.push({ emoji: '👖', text: styleFirst ? '슬랙스 또는 미디 스커트' : '청바지 또는 면바지', tag: '적합' });
    } else if (isMale) {
      items.push({ emoji: '🧥', text: isBusiness ? '슈트 재킷' : isSporty ? '바람막이' : '가벼운 재킷', tag: '필수' });
      items.push({ emoji: '👕', text: '긴팔 티셔츠', tag: '추천' });
      items.push({ emoji: '👖', text: isBusiness ? '슬랙스' : '청바지', tag: '적합' });
    } else {
      items.push({ emoji: '🧥', text: '가벼운 재킷 또는 블레이저', tag: '필수' });
      items.push({ emoji: '👕', text: '긴팔 티셔츠', tag: '추천' });
    }
  } else if (temp < 23) {
    if (isFemale) {
      items.push({ emoji: '👕', text: isBusiness ? '블라우스' : isMinimal ? '베이직 티셔츠' : isStreet ? '크롭 티셔츠' : '반팔 또는 긴팔', tag: '적합' });
      items.push({ emoji: '👖', text: styleFirst ? '와이드 팬츠 또는 롱 스커트' : '청바지 또는 면바지', tag: '적합' });
      if (!warmthFirst) items.push({ emoji: '🧥', text: '얇은 가디건 (저녁 대비)', tag: '추천' });
    } else if (isMale) {
      items.push({ emoji: '👕', text: isBusiness ? '셔츠' : isSporty ? '드라이핏 티셔츠' : '반팔 티셔츠', tag: '적합' });
      items.push({ emoji: '👖', text: isBusiness ? '치노 팬츠' : '청바지 또는 면바지', tag: '적합' });
    } else {
      items.push({ emoji: '👕', text: '얇은 가디건 또는 긴팔', tag: '적합' });
      items.push({ emoji: '👖', text: '청바지 또는 면바지', tag: '적합' });
    }
  } else if (temp < 28) {
    if (isFemale) {
      items.push({ emoji: '👕', text: isBusiness ? '반팔 블라우스' : isStreet ? '크롭 탑' : isMinimal ? '린넨 셔츠' : '반팔 티셔츠', tag: '적합' });
      items.push({ emoji: '🩳', text: styleFirst ? '미니 스커트 또는 반바지' : '반바지 또는 얇은 면바지', tag: '적합' });
    } else if (isMale) {
      items.push({ emoji: '👕', text: isBusiness ? '반팔 폴로셔츠' : isSporty ? '드라이핏 반팔' : '반팔 티셔츠', tag: '적합' });
      items.push({ emoji: '🩳', text: isBusiness ? '치노 반바지' : '반바지', tag: '적합' });
    } else {
      items.push({ emoji: '👕', text: '반팔 티셔츠', tag: '적합' });
      items.push({ emoji: '🩳', text: '반바지 또는 얇은 면바지', tag: '적합' });
    }
  } else {
    if (isFemale) {
      items.push({ emoji: '👗', text: styleFirst ? '린넨 원피스 또는 민소매' : '민소매 또는 반팔', tag: '적합' });
      items.push({ emoji: '🩳', text: '반바지 또는 숏 스커트', tag: '적합' });
    } else if (isMale) {
      items.push({ emoji: '👕', text: '민소매 또는 반팔', tag: '적합' });
      items.push({ emoji: '🩳', text: '반바지', tag: '적합' });
    } else {
      items.push({ emoji: '👕', text: '민소매 또는 반팔', tag: '적합' });
      items.push({ emoji: '🩳', text: '반바지', tag: '적합' });
    }
    items.push({ emoji: '🕶️', text: '자외선 차단제 · 선글라스 필수', tag: '필수' });
  }

  // ── 날씨 조건 추가 아이템 ──
  if (condition === 'Rain' || condition === 'Drizzle') {
    items.push({ emoji: '☂️', text: isFemale && styleFirst ? '패션 우산 또는 투명 우산' : '우산 또는 우비', tag: '필수' });
    items.push({ emoji: '👟', text: isFemale ? '방수 부츠 또는 방수 신발' : '방수 운동화', tag: '추천' });
  }
  if (condition === 'Snow') {
    items.push({ emoji: '🥾', text: isFemale ? '방한 부츠 (굽 낮은 것 권장)' : '방한 방수 부츠', tag: '필수' });
  }
  if (condition === 'Thunderstorm') {
    items.push({ emoji: '⚡', text: '실외활동 자제 · 우산 필수', tag: '주의' });
  }
  if (wind >= 9) {
    items.push({ emoji: '🌬️', text: isOutdoor ? '방풍 기능성 재킷' : isFemale ? '바람막이 또는 트렌치코트' : '바람막이 재킷', tag: '추천' });
  }
  if (aqi >= 3) {
    items.push({ emoji: '😷', text: `미세먼지 ${aqi >= 4 ? '매우나쁨' : '나쁨'} — KF94 마스크 착용`, tag: '필수' });
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

export default function OutfitRecommendation({ weather, airQuality, profile }) {
  if (!weather) {
    return (
      <div className="outfit-card">
        <h3 className="section-title"><Shirt size={16} /> 추천 코디</h3>
        <p className="empty-tasks">날씨 데이터를 불러오면 코디를 추천해 드립니다.</p>
      </div>
    );
  }

  const temp = weather.main?.temp ?? 20;
  const items = buildOutfits(weather, airQuality, profile);
  const styles = profile?.styles ?? [];
  const gender = profile?.gender ?? 'unisex';
  const genderLabel = { male: '남성', female: '여성', unisex: '공용' }[gender];

  return (
    <div className="outfit-card">
      <div className="outfit-header">
        <h3 className="section-title"><Shirt size={16} /> 추천 코디</h3>
        <span className="outfit-temp-label">{Math.round(temp)}°C · {tempLabel(temp)}</span>
      </div>

      {/* 적용된 프로필 태그 */}
      <div className="outfit-profile-tags">
        <span className="outfit-profile-tag">{genderLabel}</span>
        {styles.map(s => (
          <span key={s} className="outfit-profile-tag">{STYLE_LABEL[s] ?? s}</span>
        ))}
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
