import { CheckSquare, AlertTriangle } from 'lucide-react';
import { evaluateRule } from '../utils/ruleEngine';

export default function TaskRecommendations({ weather, rules, profile }) {
  if (!weather) return null;

  const currentRules = rules.filter(r => r.scope === 'current' || !r.scope);
  const matched = currentRules.filter(r => evaluateRule(r, weather, profile));

  if (matched.length === 0) {
    return (
      <div className="task-section">
        <h3 className="section-title"><CheckSquare size={16} /> 오늘의 자동 할 일</h3>
        <div className="empty-tasks">현재 날씨 조건에 맞는 추천 할 일이 없습니다. 좋은 날씨네요!</div>
      </div>
    );
  }

  return (
    <div className="task-section">
      <h3 className="section-title"><CheckSquare size={16} /> 오늘의 자동 할 일</h3>
      <ul className="task-list">
        {matched.map(rule => (
          <li key={rule.id} className="task-item current">
            <span className="task-bullet">✓</span>
            <span className="task-msg">{rule.message}</span>
            <span className="task-tag">현재 날씨</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
