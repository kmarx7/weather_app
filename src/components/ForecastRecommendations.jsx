import { Clock, CloudRain } from 'lucide-react';
import { evaluateForecastRule } from '../utils/ruleEngine';

export default function ForecastRecommendations({ forecast, rules }) {
  if (!forecast || forecast.length === 0) return null;

  const forecastRules = rules.filter(r => r.scope === 'forecast' && r.enabled);
  const matched = forecastRules
    .map(rule => {
      const result = evaluateForecastRule(rule, forecast, 48);
      return result ? { rule, ...result } : null;
    })
    .filter(Boolean);

  if (matched.length === 0) {
    return (
      <div className="task-section">
        <h3 className="section-title"><Clock size={16} /> 예보 기반 추천 (48시간)</h3>
        <div className="empty-tasks">앞으로 48시간 이내에 특별한 날씨 주의사항이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="task-section">
      <h3 className="section-title"><Clock size={16} /> 예보 기반 추천 (48시간)</h3>
      <ul className="task-list">
        {matched.map(({ rule, time }) => (
          <li key={rule.id} className="task-item forecast">
            <span className="task-bullet">⚑</span>
            <div className="task-content">
              <span className="task-msg">{rule.message}</span>
              <span className="task-time">{time}</span>
            </div>
            <span className="task-tag forecast">예보</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
