export const DEFAULT_RULES = [
  { id: 1, type: 'weather', operator: 'includes', value: 'rain', message: '우산 챙기기', enabled: true, scope: 'current' },
  { id: 2, type: 'weather', operator: 'includes', value: 'snow', message: '미끄럼 주의하기', enabled: true, scope: 'current' },
  { id: 3, type: 'temp', operator: 'below', value: 0, message: '수도 동파 주의', enabled: true, scope: 'current' },
  { id: 4, type: 'temp', operator: 'above', value: 30, message: '물 자주 마시기', enabled: true, scope: 'current' },
  { id: 5, type: 'wind', operator: 'above', value: 8, message: '창문 확인하기', enabled: true, scope: 'current' },
  { id: 6, type: 'humidity', operator: 'above', value: 80, message: '제습기 켜기', enabled: true, scope: 'current' },
  { id: 7, type: 'feels_like', operator: 'below', value: 5, message: '두꺼운 외투 입기', enabled: true, scope: 'current' },
  { id: 8, type: 'forecast_weather', operator: 'includes', value: 'rain', message: '예보에 비가 있습니다. 우산을 미리 준비하세요.', enabled: true, scope: 'forecast' },
  { id: 9, type: 'forecast_temp', operator: 'below', value: 0, message: '밤 기온 0도 이하 예상 — 수도 동파 대비하세요.', enabled: true, scope: 'forecast' },
  { id: 10, type: 'forecast_temp', operator: 'above', value: 33, message: '오후 폭염 예상 — 외출 시 물을 꼭 챙기세요.', enabled: true, scope: 'forecast' },
  { id: 11, type: 'forecast_weather', operator: 'includes', value: 'snow', message: '내일 눈 예보 — 미끄럼 사고에 주의하세요.', enabled: true, scope: 'forecast' },
];
