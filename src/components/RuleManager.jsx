import { useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Settings2, ChevronDown } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'weather',          label: '날씨 상태',  emoji: '🌤️', numeric: false, forecast: false },
  { value: 'temp',             label: '온도',       emoji: '🌡️', numeric: true,  forecast: false },
  { value: 'feels_like',       label: '체감온도',   emoji: '🤔', numeric: true,  forecast: false },
  { value: 'humidity',         label: '습도',       emoji: '💧', numeric: true,  forecast: false },
  { value: 'wind',             label: '풍속',       emoji: '💨', numeric: true,  forecast: false },
  { value: 'forecast_weather', label: '예보 날씨',  emoji: '📅', numeric: false, forecast: true  },
  { value: 'forecast_temp',    label: '예보 온도',  emoji: '📊', numeric: true,  forecast: true  },
];

const WEATHER_VALUES = [
  { value: 'Rain',        label: '비',       emoji: '🌧️' },
  { value: 'Snow',        label: '눈',       emoji: '❄️' },
  { value: 'Clear',       label: '맑음',     emoji: '☀️' },
  { value: 'Clouds',      label: '흐림',     emoji: '☁️' },
  { value: 'Drizzle',     label: '이슬비',   emoji: '🌦️' },
  { value: 'Thunderstorm',label: '천둥번개', emoji: '⛈️' },
  { value: 'Mist',        label: '안개',     emoji: '🌫️' },
];

const NUMERIC_PRESETS = {
  temp:          { unit: '°C', presets: [-10, 0, 5, 10, 15, 20, 25, 30, 35] },
  feels_like:    { unit: '°C', presets: [-10, 0, 5, 10, 15, 20, 25, 30, 35] },
  humidity:      { unit: '%',  presets: [30, 40, 50, 60, 70, 80, 90] },
  wind:          { unit: 'm/s',presets: [3, 5, 7, 9, 12, 15, 20] },
  forecast_temp: { unit: '°C', presets: [-10, 0, 5, 10, 15, 20, 25, 30, 35] },
};

const OPERATOR_OPTIONS = {
  weather:          [{ value: 'includes', label: '포함됨' }, { value: 'equals', label: '정확히 같음' }],
  forecast_weather: [{ value: 'includes', label: '포함됨' }, { value: 'equals', label: '정확히 같음' }],
  default:          [{ value: 'above', label: '초과 >' }, { value: 'below', label: '미만 <' }, { value: 'equals', label: '같음 =' }],
};

const BLANK = { type: 'weather', operator: 'includes', value: 'Rain', message: '', enabled: true };

function TypeStep({ value, onChange }) {
  return (
    <div className="rf-step">
      <p className="rf-step-label">① 조건 타입</p>
      <div className="rf-chip-grid">
        {TYPE_OPTIONS.map(o => (
          <button
            key={o.value}
            type="button"
            className={`rf-chip ${value === o.value ? 'active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            <span className="rf-chip-emoji">{o.emoji}</span>
            <span className="rf-chip-text">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function OperatorStep({ type, value, onChange }) {
  const ops = OPERATOR_OPTIONS[type] ?? OPERATOR_OPTIONS.default;
  return (
    <div className="rf-step">
      <p className="rf-step-label">② 연산자</p>
      <div className="rf-chip-row">
        {ops.map(o => (
          <button
            key={o.value}
            type="button"
            className={`rf-chip ${value === o.value ? 'active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ValueStep({ type, value, onChange }) {
  const isWeather = type === 'weather' || type === 'forecast_weather';
  const preset = NUMERIC_PRESETS[type];

  if (isWeather) {
    return (
      <div className="rf-step">
        <p className="rf-step-label">③ 날씨 조건 값 <span className="rf-hint">— 모두 선택 가능</span></p>
        <div className="rf-weather-grid">
          {WEATHER_VALUES.map(w => (
            <button
              key={w.value}
              type="button"
              className={`rf-weather-btn ${value === w.value ? 'active' : ''}`}
              onClick={() => onChange(w.value)}
            >
              <span className="rf-weather-emoji">{w.emoji}</span>
              <span className="rf-weather-label">{w.label}</span>
              {value === w.value && <span className="rf-selected-dot" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rf-step">
      <p className="rf-step-label">③ 값 {preset ? `(단위: ${preset.unit})` : ''}</p>
      {preset && (
        <div className="rf-preset-row">
          {preset.presets.map(p => (
            <button
              key={p}
              type="button"
              className={`rf-preset-btn ${String(value) === String(p) ? 'active' : ''}`}
              onClick={() => onChange(String(p))}
            >
              {p}{preset.unit}
            </button>
          ))}
        </div>
      )}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`직접 입력 ${preset?.unit ?? ''}`}
        className="rf-number-input"
      />
    </div>
  );
}

export default function RuleManager({ rules, onAdd, onDelete, onToggle }) {
  const [form, setForm] = useState(BLANK);
  const [showForm, setShowForm] = useState(false);

  const handleTypeChange = (type) => {
    const ops = OPERATOR_OPTIONS[type] ?? OPERATOR_OPTIONS.default;
    const isWeather = type === 'weather' || type === 'forecast_weather';
    setForm(f => ({
      ...f,
      type,
      operator: ops[0].value,
      value: isWeather ? 'Rain' : '0',
    }));
  };

  const handleAdd = () => {
    if (!form.message.trim()) return;
    const scope = ['forecast_weather', 'forecast_temp'].includes(form.type) ? 'forecast' : 'current';
    onAdd({ ...form, scope, id: Date.now() });
    setForm(BLANK);
    setShowForm(false);
  };

  const typeInfo = TYPE_OPTIONS.find(t => t.value === form.type);
  const operatorLabel = (OPERATOR_OPTIONS[form.type] ?? OPERATOR_OPTIONS.default)
    .find(o => o.value === form.operator)?.label ?? form.operator;
  const weatherLabel = WEATHER_VALUES.find(w => w.value === form.value);

  return (
    <div className="rule-manager">
      <div className="section-header">
        <h3 className="section-title"><Settings2 size={16} /> 자동화 규칙 관리</h3>
        <button
          className={`btn ${showForm ? 'btn-ghost' : 'btn-secondary'}`}
          onClick={() => { setShowForm(v => !v); setForm(BLANK); }}
        >
          {showForm ? '✕ 닫기' : <><Plus size={14} /> 규칙 추가</>}
        </button>
      </div>

      {showForm && (
        <div className="rule-form-visual">
          <TypeStep value={form.type} onChange={handleTypeChange} />
          <OperatorStep type={form.type} value={form.operator} onChange={v => setForm(f => ({ ...f, operator: v }))} />
          <ValueStep type={form.type} value={form.value} onChange={v => setForm(f => ({ ...f, value: v }))} />

          {/* 미리보기 */}
          <div className="rf-preview">
            <span className="rf-preview-label">조건 미리보기</span>
            <span className="rf-preview-text">
              {typeInfo?.emoji} {typeInfo?.label} {operatorLabel}{' '}
              <strong>{weatherLabel ? `${weatherLabel.emoji} ${weatherLabel.label}` : `${form.value}${NUMERIC_PRESETS[form.type]?.unit ?? ''}`}</strong>
            </span>
          </div>

          <div className="rf-step">
            <p className="rf-step-label">④ 할 일 메시지</p>
            <input
              type="text"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="조건 충족 시 표시할 메시지"
              className="rf-message-input"
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.message.trim()}>
              <Plus size={14} /> 규칙 추가
            </button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="rule-list">
        {rules.length === 0 && <p className="empty-tasks">등록된 규칙이 없습니다.</p>}
        {rules.map(rule => {
          const t = TYPE_OPTIONS.find(o => o.value === rule.type);
          const wv = WEATHER_VALUES.find(w => w.value === rule.value);
          const unit = NUMERIC_PRESETS[rule.type]?.unit ?? '';
          return (
            <div key={rule.id} className={`rule-item ${rule.enabled ? '' : 'disabled'}`}>
              <button className="toggle-btn" onClick={() => onToggle(rule.id)}>
                {rule.enabled
                  ? <ToggleRight size={20} className="toggle-on" />
                  : <ToggleLeft size={20} className="toggle-off" />}
              </button>
              <div className="rule-body">
                <span className="rule-condition">
                  <span className="rule-tag">{t?.emoji} {t?.label ?? rule.type}</span>
                  <span className="rule-op">{rule.operator}</span>
                  <span className="rule-val">
                    {wv ? `${wv.emoji} ${wv.label}` : `${rule.value}${unit}`}
                  </span>
                  <span className={`rule-scope ${rule.scope}`}>{rule.scope === 'forecast' ? '예보' : '현재'}</span>
                </span>
                <span className="rule-msg">→ {rule.message}</span>
              </div>
              <button className="icon-btn danger" onClick={() => onDelete(rule.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
