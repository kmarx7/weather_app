import { User, Shirt } from 'lucide-react';

const SENSITIVITY = ['low', 'medium', 'high'];
const SENSITIVITY_KO = { low: '낮음', medium: '보통', high: '높음' };

const GENDERS = [
  { value: 'male',   label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'unisex', label: '무관' },
];

const STYLES = [
  { value: 'casual',    label: '캐주얼', desc: '편하고 자유로운 스타일' },
  { value: 'business',  label: '비즈니스', desc: '깔끔하고 단정한 스타일' },
  { value: 'sporty',    label: '스포티', desc: '활동적이고 기능적인 스타일' },
  { value: 'street',    label: '스트리트', desc: '트렌디하고 개성 있는 스타일' },
  { value: 'minimal',   label: '미니멀', desc: '심플하고 모던한 스타일' },
  { value: 'outdoor',   label: '아웃도어', desc: '등산·캠핑 등 야외 활동 중심' },
];

const OUTFIT_PRIORITIES = [
  { value: 'warmth',  label: '보온 우선', desc: '추위를 막는 것이 최우선' },
  { value: 'style',   label: '스타일 우선', desc: '패션을 유지하며 날씨 대응' },
  { value: 'comfort', label: '편안함 우선', desc: '편의성과 활동성 중시' },
];

export default function ProfileSettings({ profile, onChange }) {
  const set = (key, value) => onChange({ ...profile, [key]: value });

  return (
    <div className="profile-settings">
      <h3 className="section-title"><User size={16} /> 개인 맞춤 설정</h3>

      <div className="profile-grid">
        {/* 기존: 추위/더위 민감도 */}
        <div className="profile-field">
          <label>추위 민감도</label>
          <div className="sensitivity-group">
            {SENSITIVITY.map(s => (
              <button
                key={s}
                className={`sens-btn ${profile.coldSensitivity === s ? 'active cold' : ''}`}
                onClick={() => set('coldSensitivity', s)}
              >
                {SENSITIVITY_KO[s]}
              </button>
            ))}
          </div>
          <p className="field-hint">높음: 더 낮은 온도에서도 방한 복장 추천</p>
        </div>

        <div className="profile-field">
          <label>더위 민감도</label>
          <div className="sensitivity-group">
            {SENSITIVITY.map(s => (
              <button
                key={s}
                className={`sens-btn ${profile.heatSensitivity === s ? 'active heat' : ''}`}
                onClick={() => set('heatSensitivity', s)}
              >
                {SENSITIVITY_KO[s]}
              </button>
            ))}
          </div>
          <p className="field-hint">높음: 더 낮은 온도에서도 더위 주의 추천</p>
        </div>

        <div className="profile-field">
          <label>기본 외출 시간</label>
          <input
            type="time"
            value={profile.commuteTime ?? '08:00'}
            onChange={e => set('commuteTime', e.target.value)}
            className="time-input"
          />
        </div>

        <div className="profile-field">
          <label>선호 지역</label>
          <input
            type="text"
            value={profile.preferredCity ?? ''}
            onChange={e => set('preferredCity', e.target.value)}
            placeholder="기본으로 볼 도시"
            className="text-input"
          />
        </div>
      </div>

      {/* 코디 설정 섹션 */}
      <div className="profile-section-divider">
        <Shirt size={15} />
        <span>추천 코디 설정</span>
      </div>

      <div className="profile-grid">
        {/* 성별 */}
        <div className="profile-field">
          <label>성별</label>
          <div className="chip-group">
            {GENDERS.map(g => (
              <button
                key={g.value}
                className={`chip-btn ${profile.gender === g.value ? 'active' : ''}`}
                onClick={() => set('gender', g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>
          <p className="field-hint">선택한 성별에 맞는 아이템을 추천합니다</p>
        </div>

        {/* 코디 우선순위 */}
        <div className="profile-field">
          <label>코디 우선순위</label>
          <div className="chip-group">
            {OUTFIT_PRIORITIES.map(p => (
              <button
                key={p.value}
                className={`chip-btn ${profile.outfitPriority === p.value ? 'active' : ''}`}
                onClick={() => set('outfitPriority', p.value)}
                title={p.desc}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="field-hint">
            {OUTFIT_PRIORITIES.find(p => p.value === profile.outfitPriority)?.desc ?? '코디 추천 방식을 선택하세요'}
          </p>
        </div>

        {/* 선호 스타일 (복수 선택) */}
        <div className="profile-field full-width">
          <label>선호 스타일 <span className="field-badge">복수 선택 가능</span></label>
          <div className="style-grid">
            {STYLES.map(s => {
              const selected = (profile.styles ?? []).includes(s.value);
              return (
                <button
                  key={s.value}
                  className={`style-btn ${selected ? 'active' : ''}`}
                  onClick={() => {
                    const current = profile.styles ?? [];
                    const next = selected
                      ? current.filter(v => v !== s.value)
                      : [...current, s.value];
                    set('styles', next);
                  }}
                >
                  <span className="style-btn-label">{s.label}</span>
                  <span className="style-btn-desc">{s.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
