import { useState } from 'react';
import { Search, Plus, AlertCircle } from 'lucide-react';

export default function CitySearch({ onAdd, loading, error }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onAdd(trimmed);
    setInput('');
  };

  return (
    <div className="city-search-wrap">
      <form onSubmit={handleSubmit} className="city-search">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="도시 이름 입력 (예: 서울, Tokyo)"
            className="search-input"
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary">
          <Plus size={16} />
          {loading ? '조회 중…' : '추가'}
        </button>
      </form>
      {error && (
        <div className="city-search-error">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
