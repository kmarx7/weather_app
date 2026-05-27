import { Calendar, Droplets, Wind } from 'lucide-react';

const CONDITION_ICON = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Snow: '❄️', Thunderstorm: '⛈️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
};

const CONDITION_KR = {
  Clear: '맑음', Clouds: '흐림', Rain: '비', Drizzle: '이슬비',
  Snow: '눈', Thunderstorm: '천둥번개', Mist: '안개', Fog: '안개', Haze: '연무',
};

const CONDITION_COLOR = {
  Clear: '#f59e0b', Clouds: '#64748b', Rain: '#3b82f6', Drizzle: '#60a5fa',
  Snow: '#0ea5e9', Thunderstorm: '#7c3aed', Mist: '#94a3b8', Fog: '#94a3b8', Haze: '#d97706',
};

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

function aggregateDaily(forecast) {
  const days = {};
  forecast.forEach(item => {
    const date = new Date(item.dt * 1000);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!days[key]) {
      days[key] = { date, slots: [] };
    }
    days[key].slots.push(item);
  });

  return Object.entries(days).map(([, d]) => {
    const temps = d.slots.map(s => s.main.temp);
    const condCounts = {};
    d.slots.forEach(s => {
      const c = s.weather?.[0]?.main ?? 'Clear';
      condCounts[c] = (condCounts[c] || 0) + 1;
    });
    const dominantCond = Object.entries(condCounts).sort((a, b) => b[1] - a[1])[0][0];
    const avgHumidity = Math.round(d.slots.reduce((s, i) => s + i.main.humidity, 0) / d.slots.length);
    const avgWind = (d.slots.reduce((s, i) => s + i.wind.speed, 0) / d.slots.length).toFixed(1);
    const maxPop = Math.round(Math.max(...d.slots.map(s => s.pop ?? 0)) * 100);

    // Up to 4 time slots spread through the day
    const hourSlots = d.slots
      .filter(s => {
        const h = new Date(s.dt * 1000).getHours();
        return [3, 9, 15, 21].includes(h);
      })
      .slice(0, 4);

    return {
      date: d.date,
      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
      condition: dominantCond,
      humidity: avgHumidity,
      wind: avgWind,
      pop: maxPop,
      hourSlots,
    };
  }).slice(0, 5);
}

function TempBar({ low, high, absLow, absHigh }) {
  const range = absHigh - absLow || 1;
  const left = ((low - absLow) / range) * 100;
  const width = ((high - low) / range) * 100;
  return (
    <div className="wf-bar-track">
      <div
        className="wf-bar-fill"
        style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }}
      />
    </div>
  );
}

export default function WeeklyForecast({ forecast }) {
  if (!forecast || forecast.length === 0) return null;

  const days = aggregateDaily(forecast);
  const todayStr = new Date().toDateString();

  const allHighs = days.map(d => d.high);
  const allLows = days.map(d => d.low);
  const absHigh = Math.max(...allHighs);
  const absLow = Math.min(...allLows);

  return (
    <div className="weekly-forecast-card">
      <h3 className="section-title"><Calendar size={16} /> 5일 날씨 예보</h3>
      <div className="wf-list">
        {days.map((day, i) => {
          const isToday = day.date.toDateString() === todayStr;
          const dayName = isToday ? '오늘' : `${DAY_KR[day.date.getDay()]}요일`;
          const dateStr = `${day.date.getMonth() + 1}월 ${day.date.getDate()}일`;
          const color = CONDITION_COLOR[day.condition] ?? '#64748b';

          return (
            <div key={i} className={`wf-day-card${isToday ? ' today' : ''}`}>
              {/* Row 1: date + condition */}
              <div className="wf-top">
                <div className="wf-date-block">
                  <span className="wf-dayname">{dayName}</span>
                  <span className="wf-date">{dateStr}</span>
                </div>
                <div className="wf-cond-block">
                  <span className="wf-icon">{CONDITION_ICON[day.condition] ?? '🌡️'}</span>
                  <span className="wf-cond" style={{ color }}>{CONDITION_KR[day.condition] ?? day.condition}</span>
                </div>
                <div className="wf-temp-block">
                  <span className="wf-high">{day.high}°</span>
                  <span className="wf-slash"> / </span>
                  <span className="wf-low">{day.low}°</span>
                </div>
              </div>

              {/* Row 2: temp bar */}
              <TempBar low={day.low} high={day.high} absLow={absLow} absHigh={absHigh} />

              {/* Row 3: stats */}
              <div className="wf-stats">
                {day.pop > 0 && (
                  <span className="wf-stat wf-pop">💧 강수 {day.pop}%</span>
                )}
                <span className="wf-stat">
                  <Droplets size={12} /> 습도 {day.humidity}%
                </span>
                <span className="wf-stat">
                  <Wind size={12} /> 풍속 {day.wind}m/s
                </span>
              </div>

              {/* Row 4: hourly slots */}
              {day.hourSlots.length > 0 && (
                <div className="wf-hourly">
                  {day.hourSlots.map((slot, j) => {
                    const h = new Date(slot.dt * 1000).getHours();
                    const label = h === 0 ? '자정' : h < 12 ? `오전${h}시` : h === 12 ? '정오' : `오후${h - 12}시`;
                    const slotCond = slot.weather?.[0]?.main ?? 'Clear';
                    return (
                      <div key={j} className="wf-hour-slot">
                        <span className="wf-hour-label">{label}</span>
                        <span className="wf-hour-icon">{CONDITION_ICON[slotCond] ?? '🌡️'}</span>
                        <span className="wf-hour-temp">{Math.round(slot.main.temp)}°</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
