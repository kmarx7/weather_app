import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Settings2 } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'weather', label: '날씨 상태' },
  { value: 'temp', label: '온도' },
  { value: 'feels_like', label: '체감온도' },
  { value: 'humidity', label: '습도' },
  { value: 'wind', label: '풍속' },
  { value: 'forecast_weather', label: '예보 날씨' },
  { value: 'forecast_temp', label: '예보 온도' },
];

const OPERATOR_OPTIONS = {
  weather: [{ value: 'includes', label: '포함' }, { value: 'equals', label: '같음' }],
  forecast_weather: [{ value: 'includes', label: '포함' }, { value: 'equals', label: '같음' }],
  default: [
    { value: 'above', label: '초과' },
    { value: 'below', label: '미만' },
    { value: 'equals', label: '같음' },
  ],
};

const SCOPE_FOR_TYPE = {
  forecast_weather: 'forecast',
  forecast_temp: 'forecast',
};

const BLANK = { type: 'weather', operator: 'includes', value: 'rain', message: '', enabled: true };

export default function RuleManager({ rules, onAdd, onDelete, onToggle }) {
  const [form, setForm] = useState(BLANK);
  const [showForm, setShowForm] = useState(false);

  const operators = OPERATOR_OPTIONS[form.type] ?? OPERATOR_OPTIONS.default;

  const handleAdd = () => {
    if (!form.message.trim()) return;
    const scope = SCOPE_FOR_TYPE[form.type] ?? 'current';
    onAdd({ ...form, scope, id: Date.now() });
    setForm(BLANK);
    setShowForm(false);
  };

  return (
    <div className="rule-manager">
      <div className="section-header">
        <h3 className="section-title"><Settings2 size={16} /> 자동화 규칙 관리</h3>
        <button className="btn btn-secondary" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> 규칙 추가
        </button>
      </div>

      {showForm && (
        <div className="rule-form">
          <div className="form-row">
            <label>조건 타입</label>
            <select
              value={form.type}
              onChange={e => {
                const type = e.target.value;
                const ops = OPERATOR_OPTIONS[type] ?? OPERATOR_OPTIONS.default;
                setForm(f => ({ ...f, type, operator: ops[0].value }));
              }}
            >
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>연산자</label>
            <select value={form.operator} onChange={e => setForm(f => ({ ...f, operator: e.target.value }))}>
              {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>값</label>
            <input
              type="text"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder={form.type.includes('weather') ? 'rain, snow, clear ...' : '숫자 입력'}
            />
          </div>
          <div className="form-row">
            <label>할 일 메시지</label>
            <input
              type="text"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="조건 충족 시 보여줄 메시지"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.message.trim()}>추가</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="rule-list">
        {rules.length === 0 && <p className="empty-tasks">등록된 규칙이 없습니다.</p>}
        {rules.map(rule => (
          <div key={rule.id} className={`rule-item ${rule.enabled ? '' : 'disabled'}`}>
            <button className="toggle-btn" onClick={() => onToggle(rule.id)} title={rule.enabled ? '비활성화' : '활성화'}>
              {rule.enabled ? <ToggleRight size={20} className="toggle-on" /> : <ToggleLeft size={20} className="toggle-off" />}
            </button>
            <div className="rule-body">
              <span className="rule-condition">
                <span className="rule-tag">{rule.type}</span>
                <span className="rule-op">{rule.operator}</span>
                <span className="rule-val">{String(rule.value)}</span>
                <span className={`rule-scope ${rule.scope}`}>{rule.scope === 'forecast' ? '예보' : '현재'}</span>
              </span>
              <span className="rule-msg">→ {rule.message}</span>
            </div>
            <button className="icon-btn danger" onClick={() => onDelete(rule.id)} title="삭제">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
