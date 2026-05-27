import { ScrollText, Trash2 } from 'lucide-react';

export default function ActivityLog({ logs, onClear }) {
  return (
    <div className="activity-log">
      <div className="section-header">
        <h3 className="section-title"><ScrollText size={16} /> 실행 로그</h3>
        {logs.length > 0 && (
          <button className="btn btn-ghost" onClick={onClear}>
            <Trash2 size={13} /> 지우기
          </button>
        )}
      </div>
      {logs.length === 0 ? (
        <p className="empty-tasks">로그가 없습니다.</p>
      ) : (
        <ul className="log-list">
          {[...logs].reverse().map((log, i) => (
            <li key={i} className={`log-item log-${log.type}`}>
              <span className="log-time">{log.time}</span>
              <span className="log-msg">{log.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
