import { Sparkles, RefreshCw } from 'lucide-react';
import { generateSummary } from '../utils/aiSummary';

export default function AiSummary({ cityName, weather, forecast, tasks, forecastTasks, profile }) {
  const summary = generateSummary(cityName, weather, forecast, tasks, forecastTasks, profile);

  if (!summary) {
    return (
      <div className="ai-summary empty">
        <Sparkles size={16} />
        <p>도시를 선택하면 AI 요약이 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="ai-summary">
      <div className="ai-summary-header">
        <Sparkles size={15} />
        <span>AI 날씨 요약</span>
        <span className="ai-badge">규칙 기반</span>
      </div>
      <p className="ai-text">{summary}</p>
    </div>
  );
}
