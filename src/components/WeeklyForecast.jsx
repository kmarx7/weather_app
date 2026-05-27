import { Calendar } from 'lucide-react';

const CONDITION_ICON = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Snow: '❄️', Thunderstorm: '⛈️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
};

const CONDITION_KR = {
  Clear: '맑음', Clouds: '흐림', Rain: '비', Drizzle: '이슬비',
  Snow: '눈', Thunderstorm: '천둥', Mist: '안개', Fog: '안개', Haze: '연무',
};

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

function aggregateDaily(forecast) {
  const days = {};
  forecast.forEach(item => {
    const date = new Date(item.dt * 1000);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!days[key]) {
      days[key] = { date, temps: [], conditions: {}, pops: [] };
    }
    days[key].temps.push(item.main.temp);
    const cond = item.weather?.[0]?.main ?? 'Clear';
    days[key].conditions[cond] = (days[key].conditions[cond] || 0) + 1;
    days[key].pops.push(item.pop ?? 0);
  });

  return Object.entries(days).map(([, d]) => {
    const dominantCond = Object.entries(d.conditions).sort((a, b) => b[1] - a[1])[0][0];
    return {
      date: d.date,
      high: Math.round(Math.max(...d.temps)),
      low: Math.round(Math.min(...d.temps)),
      condition: dominantCond,
      pop: Math.round(Math.max(...d.pops) * 100),
    };
  }).slice(0, 5);
}

export default function WeeklyForecast({ forecast }) {
  if (!forecast || forecast.length === 0) return null;

  const days = aggregateDaily(forecast);
  const todayStr = new Date().toDateString();

  return (
    <div className="weekly-forecast-card">
      <h3 className="section-title"><Calendar size={16} /> 5일 날씨 예보</h3>
      <div className="weekly-list">
        {days.map((day, i) => {
          const isToday = day.date.toDateString() === todayStr;
          const dayName = isToday ? '오늘' : `${DAY_KR[day.date.getDay()]}요일`;
          const dateStr = `${day.date.getMonth() + 1}/${day.date.getDate()}`;
          return (
            <div key={i} className={`weekly-item${isToday ? ' today' : ''}`}>
              <div className="weekly-day">
                <span className="weekly-dayname">{dayName}</span>
                <span className="weekly-date">{dateStr}</span>
              </div>
              <span className="weekly-icon">{CONDITION_ICON[day.condition] ?? '🌡️'}</span>
              <span className="weekly-cond">{CONDITION_KR[day.condition] ?? day.condition}</span>
              <span className="weekly-pop">{day.pop > 0 ? `💧${day.pop}%` : ''}</span>
              <div className="weekly-temps">
                <span className="weekly-high">{day.high}°</span>
                <span className="weekly-sep"> / </span>
                <span className="weekly-low">{day.low}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
