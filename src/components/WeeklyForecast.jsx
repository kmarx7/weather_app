import { Calendar } from 'lucide-react';

const CONDITION_ICON = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Snow: '❄️', Thunderstorm: '⛈️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
};

const CONDITION_KR = {
  Clear: '맑음', Clouds: '흐림', Rain: '비', Drizzle: '이슬비',
  Snow: '눈', Thunderstorm: '천둥번개', Mist: '안개', Fog: '안개', Haze: '연무',
};

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

function aggregateDaily(forecast) {
  const days = {};
  forecast.forEach(item => {
    const date = new Date(item.dt * 1000);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!days[key]) days[key] = { date, temps: [], conditions: {}, pops: [] };
    days[key].temps.push(item.main.temp);
    const c = item.weather?.[0]?.main ?? 'Clear';
    days[key].conditions[c] = (days[key].conditions[c] || 0) + 1;
    days[key].pops.push(item.pop ?? 0);
  });

  return Object.entries(days).map(([, d]) => {
    const cond = Object.entries(d.conditions).sort((a, b) => b[1] - a[1])[0][0];
    return {
      date: d.date,
      high: Math.round(Math.max(...d.temps)),
      low: Math.round(Math.min(...d.temps)),
      condition: cond,
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
      <div className="wf-cards">
        {days.map((day, i) => {
          const isToday = day.date.toDateString() === todayStr;
          const dayName = isToday ? '오늘' : `${DAY_KR[day.date.getDay()]}요일`;
          const dateStr = `${day.date.getMonth() + 1}/${day.date.getDate()}`;
          const icon = CONDITION_ICON[day.condition] ?? '🌡️';
          const cond = CONDITION_KR[day.condition] ?? day.condition;
          return (
            <div key={i} className={`wf-card${isToday ? ' today' : ''}`}>
              <span className="wfc-dayname">{dayName}</span>
              <span className="wfc-date">{dateStr}</span>
              <span className="wfc-icon">{icon}</span>
              <span className="wfc-cond">{cond}</span>
              <span className="wfc-high">{day.high}°</span>
              <span className="wfc-low">{day.low}°</span>
              {day.pop > 0 && <span className="wfc-pop">💧{day.pop}%</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
