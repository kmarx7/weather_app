import { User } from 'lucide-react';

const SENSITIVITY = ['low', 'medium', 'high'];
const SENSITIVITY_KO = { low: '낮음', medium: '보통', high: '높음' };

export default function ProfileSettings({ profile, onChange }) {
  const set = (key, value) => onChange({ ...profile, [key]: value });

  return (
    <div className="profile-settings">
      <h3 className="section-title"><User size={16} /> 개인 맞춤 설정</h3>

      <div className="profile-grid">
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
    </div>
  );
}
