import { useState } from 'react';
import { Search, Plus, AlertCircle, MapPin, X } from 'lucide-react';

const COUNTRY_FLAG = { KR: '🇰🇷', JP: '🇯🇵', US: '🇺🇸', CN: '🇨🇳', GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪' };

function candidateLabel(c) {
  const name = c.local_names?.ko ?? c.local_names?.en ?? c.name;
  const parts = [c.state, c.country !== 'KR' ? c.country : null].filter(Boolean);
  return { name, region: parts.join(' · '), flag: COUNTRY_FLAG[c.country] ?? '🌍' };
}

export default function CitySearch({ onSearch, onSelect, candidates, loading, error, onClear }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
  };

  const handleSelect = (c) => {
    const { name } = candidateLabel(c);
    setInput('');
    onSelect(c, name);
  };

  return (
    <div className="city-search-wrap">
      <form onSubmit={handleSubmit} className="city-search">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); if (candidates?.length) onClear(); }}
            placeholder="도시 검색 (예: 안산, 경기 안산, Tokyo)"
            className="search-input"
            disabled={loading}
          />
          {(input || candidates?.length > 0) && (
            <button type="button" className="search-clear-btn" onClick={() => { setInput(''); onClear(); }}>
              <X size={14} />
            </button>
          )}
        </div>
        <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary">
          <Search size={16} />
          {loading ? '검색 중…' : '검색'}
        </button>
      </form>

      {error && (
        <div className="city-search-error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}

      {candidates && candidates.length > 0 && (
        <div className="search-candidates">
          <p className="candidates-hint">지역을 선택하세요</p>
          {candidates.map((c, i) => {
            const { name, region, flag } = candidateLabel(c);
            return (
              <button key={i} className="candidate-item" onClick={() => handleSelect(c)}>
                <span className="candidate-flag">{flag}</span>
                <div className="candidate-info">
                  <span className="candidate-name">{name}</span>
                  {region && <span className="candidate-region">{region}</span>}
                </div>
                <Plus size={15} className="candidate-add-icon" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
