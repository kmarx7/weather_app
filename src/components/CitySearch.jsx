import { useState } from 'react';
import { Search, Plus } from 'lucide-react';

export default function CitySearch({ onAdd, loading }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="city-search">
      <div className="search-input-wrap">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="도시 이름 입력 (예: Seoul, Tokyo, New York)"
          className="search-input"
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary">
        <Plus size={16} />
        지역 추가
      </button>
    </form>
  );
}
